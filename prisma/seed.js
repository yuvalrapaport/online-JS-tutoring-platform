const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const codeBlocks = [
    {
      title: "Array filter",
      code: "const numbers = [1, 2, 3, 4, 5, 6];\n\nconst evenNumbers = numbers.filter(number => {\n  //TODO: Implement code to filter even numbers\n});\n\nconsole.log(evenNumbers);",
    },
    {
      title: "Promise chaining",
      code: 'const fetchUser = () => {\n  return fetch("https://jsonplaceholder.typicode.com/users/1")\n    .then(response => {\n      //TODO: Implement code to parse response body to JSON\n    })\n    .then(user => {\n      //TODO: Implement code to fetch user posts\n    })\n    .then(posts => {\n      //TODO: Implement code to return user with posts\n    })\n    .catch(error => {\n      console.error(error);\n    });\n};\n\nfetchUser().then(user => {\n  console.log(user);\n});',
    },
    {
      title: "Event listener",
      code: "const button = document.querySelector('#my-button');\n\nbutton.addEventListener('click', event => {\n //TODO: Implement code to handle button click event\n});",
    },
    {
      title: "Sum array",
      code: "function sumOfEvenNumbers(arr) {\n // Your code here\n}",
    },
  ];

  for (let codeBlock of codeBlocks) {
    await prisma.codeBlock.create({
      data: codeBlock,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
