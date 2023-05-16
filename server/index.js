const http = require("http");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { WebSocketServer, OPEN } = require("ws");

const prisma = new PrismaClient();

const server = http.createServer(async (req, res) => {
  // Set the content type based on the file extension
  let contentType = "";

  if (req.url.startsWith("/codeblocks/")) {
    const filePath = path.join(__dirname, "../client", "codeblock.html");
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          // If the requested file does not exist, send a 404 error
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File not found");
        } else {
          // If there is an error reading the file, send a 500 error
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(err.message);
        }
      } else {
        // If the file exists, send it back with the appropriate content type
        const url = req.url;
        contentType = "text/html";
        res.writeHead(200, { "Content-Type": contentType });
        content = content.toString().replace("URL", url); // Replace the placeholder <!--URL--> in the HTML with the actual URL
        res.end(content, "utf-8");
      }
    });
  } else if (req.url === "/") {
    // Close all connections
    numConnect = 0;
    contentType = "text/html";
    const filePath = path.join(__dirname, "../client", "/index.html");
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          // If the requested file does not exist, send a 404 error
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File not found");
        } else {
          // If there is an error reading the file, send a 500 error
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(err.message);
        }
      } else {
        // If the file exists, send it back with the appropriate content type
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  } else if (req.url === "/app.css") {
    contentType = "text/css";
    const filePath = path.join(__dirname, "../client", req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          // If the requested file does not exist, send a 404 error
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File not found");
        } else {
          // If there is an error reading the file, send a 500 error
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(err.message);
        }
      } else {
        // If the file exists, send it back with the appropriate content type
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  } else {
    // If the requested URL is not recognized, send a 404 error
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});
let numConnect = 0;
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  let first = true;

  ws.addEventListener("message", async (message) => {
    const messageData = JSON.parse(message.data);
    // Send the code block data to all connected clients
    if (first) {
      first = false;
      const id = messageData.data.split("/")[2];
      // Retrieve the code block with the given ID from the database
      try {
        const codeBlock = await prisma.codeBlock.findUnique({
          where: {
            id: parseInt(id),
          },
        });
        if (ws.readyState === OPEN) {
          numConnect++;

          ws.send(
            JSON.stringify({
              type: "codeblock",
              numConnect: numConnect,
              data: codeBlock.code,
              firstMsg: true,
            })
          );
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: err.message }));
        ws.close();
      }
    } else {
      if (messageData.type === "codeblock") {
        wss.clients.forEach((client) => {
          if (client.readyState === OPEN) {
            client.send(
              JSON.stringify({
                type: "codeblock",
                data: messageData.data,
                firstMsg: false,
              })
            );
          }
        });
      }
    }
  });

  ws.on("close", (event) => {
    ws.send("WebSocket closed: ", event.code, event.reason);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, async () => {
  console.log("http://localhost:3000/");
});
