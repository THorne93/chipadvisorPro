const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('ChipsNBeans69420', 10);
    const user = await prisma.user.create({
      data: {
        username: "CHIPMAN",
        email: "chipman@example.com",
        password: hashedPassword,
        role: "ADMIN", // Assigning the role as ADMIN
      },
    });

    console.log(`Created user: ${user.username}`);
  
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
