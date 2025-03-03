import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Load updated skills from JSON file
const updatedSkills = JSON.parse(fs.readFileSync("prisma/chunk1.json", "utf-8"));

const updateCareerSkills = async () => {
  for (const career of updatedSkills) {
    const existingCareer = await prisma.career.findFirst({
      where: { title: career.title }, // Match careers by title
    });

    if (existingCareer) {
      await prisma.career.update({
        where: { id: existingCareer.id },
        data: { requiredSkills: career.requiredSkills },
      });
      console.log(`✅ Updated skills for: ${career.title}`);
    } else {
      console.log(`❌ Career not found: ${career.title}`);
    }
  }
};

updateCareerSkills()
  .then(() => {
    console.log("✅ Career skills updated successfully!");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Error updating career skills:", error);
    prisma.$disconnect();
  });
