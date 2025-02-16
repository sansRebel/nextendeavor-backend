import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Load long descriptions from JSON file
const longDescriptions = JSON.parse(fs.readFileSync("prisma/chunk1.json", "utf-8"));

const updateLongDescriptions = async () => {
  for (const career of longDescriptions) {
    const existingCareer = await prisma.career.findFirst({
      where: { title: career.title }, // Match by title
    });

    if (existingCareer) {
      await prisma.career.update({
        where: { id: existingCareer.id },
        data: { longDescription: career.longDescription },
      });
      console.log(`✅ Updated long description for: ${career.title}`);
    } else {
      console.log(`❌ Career not found: ${career.title}`);
    }
  }
};

updateLongDescriptions()
  .then(() => {
    console.log("✅ Career descriptions updated successfully!");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Error updating careers:", error);
    prisma.$disconnect();
  });
