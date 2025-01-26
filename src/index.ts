import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: "testing@example.com",
      password: "password123",
      name: "Testing User",
      skills: ["JavaScript", "TypeScript"],
      interests: ["Web Development"],
    },
  });

  // Create a career
  const career = await prisma.career.create({
    data: {
      title: "Software Engineer",
      description: "Develops and maintains software systems.",
      requiredSkills: ["JavaScript", "React", "Node.js"],
      salaryRange: "$60,000 - $100,000",
      demand: 8,
    },
  });

  // Create a recommendation
  const recommendation = await prisma.recommendation.create({
    data: {
      userId: user.id,
      careerId: career.id,
      saved: true,
    },
  });

  console.log("User:", user);
  console.log("Career:", career);
  console.log("Recommendation:", recommendation);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
