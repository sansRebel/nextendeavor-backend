import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Load careers from JSON file
const careersData = JSON.parse(fs.readFileSync("prisma/chunk1.json", "utf-8"));

const updateCareers = async () => {
  for (const career of careersData) {
    // Check if the career already exists to prevent duplicates
    const existingCareer = await prisma.career.findFirst({
      where: { title: career.title },
    });

    if (!existingCareer) {
      await prisma.career.create({
        data: {
          title: career.title,
          description: career.description,
          longDescription: "To be updated...", // Placeholder, will update later
          requiredSkills: career.requiredSkills,
          salaryRange: career.salaryRange,
          industry: career.industry,
          demand: career.demand,
          growthPotential: career.growthPotential,
        },
      });
      console.log(`✅ Added: ${career.title}`);
    } else {
      console.log(`⚠️ Skipped (Already Exists): ${career.title}`);
    }
  }
};

updateCareers()
  .then(() => {
    console.log("✅ Careers added successfully!");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Error updating careers:", error);
    prisma.$disconnect();
  });
