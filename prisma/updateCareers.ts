import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateCareers() {
  console.log("🔄 Updating careers with missing fields...");

  const careers = await prisma.career.findMany();

  for (const career of careers) {
    let updateData: any = {};

    // ✅ Extract salary min and max if missing
    if (career.salaryMin === null || career.salaryMax === null) {
      const salaryMinMax = extractSalaryRange(career.salaryRange);
      if (salaryMinMax.min > 0) updateData.salaryMin = salaryMinMax.min;
      if (salaryMinMax.max > 0) updateData.salaryMax = salaryMinMax.max;
    }

    // ✅ Ensure the industry is set
    if (!career.industry) {
      updateData.industry = mapTitleToIndustry(career.title);
    }

    // ✅ Assign random growth potential and job availability
    if (career.growthPotential === null) {
      updateData.growthPotential = getRandomValue(5, 10); // Growth potential (scale 5-10)
    }

    if (career.jobAvailability === null) {
      updateData.jobAvailability = getRandomValue(1, 100); // Number of job openings
    }

    // ✅ Set default skillMatchScore & interestMatchScore if missing
    if (career.skillMatchScore === null) {
      updateData.skillMatchScore = getRandomValue(1, 10);
    }

    if (career.interestMatchScore === null) {
      updateData.interestMatchScore = getRandomValue(1, 10);
    }

    // ✅ Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.career.update({
        where: { id: career.id },
        data: updateData,
      });
      console.log(`✅ Updated: ${career.title} with ${JSON.stringify(updateData)}`);
    }
  }

  console.log("✅ All careers updated successfully!");
}

// ✅ Extracts salary min and max from "salaryRange" string
function extractSalaryRange(salaryRange: string) {
  const match = salaryRange.match(/\$?(\d{1,3}(?:,\d{3})*)/g);
  if (match) {
    const min = parseInt(match[0].replace(/,/g, ""), 10) || 0;
    const max = parseInt(match[1]?.replace(/,/g, ""), 10) || min;
    return { min, max };
  }
  return { min: 0, max: 0 };
}

// ✅ Maps job titles to industries
function mapTitleToIndustry(title: string) {
  const industryMap: { [key: string]: string } = {
    "Lawyer": "Legal",
    "Surgeon": "Healthcare",
    "Software Engineer": "Technology",
    "Architect": "Design & Construction",
    "Economist": "Finance",
    "Civil Engineer": "Engineering",
    "Data Analyst": "Technology",
    "Psychologist": "Healthcare",
    "Accountant": "Finance",
  };

  return industryMap[title] || "General";
}

// ✅ Generates a random value within a range
function getRandomValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

updateCareers()
  .catch((e) => {
    console.error("❌ Error updating careers:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
