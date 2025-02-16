import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Load the chunk data
const updatedCareers = JSON.parse(fs.readFileSync("prisma/chunk1.json", "utf-8"));

const updateRequiredSkills = async () => {
  for (const career of updatedCareers) {
    const existingCareer = await prisma.career.findFirst({
      where: { title: career.title }, // Search by title instead of ID
    });

    if (existingCareer) {
      await prisma.career.update({
        where: { id: existingCareer.id }, // Use the found ID
        data: { requiredSkills: career.requiredSkills },
      });
      console.log(`✅ Updated skills for: ${career.title}`);
    } else {
      console.log(`❌ Career not found: ${career.title}`);
    }
  }
};

updateRequiredSkills()
  .then(() => {
    console.log("✅ Career skills updated successfully!");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Error updating careers:", error);
    prisma.$disconnect();
  });
