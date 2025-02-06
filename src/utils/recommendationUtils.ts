import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Reusable function to generate career recommendations
export const generateCareerRecommendations = async (skills: string[], interests: string[]) => {
  try {
    const careers = await prisma.career.findMany();

    // ✅ Score careers based on skills & interests
    const scoredCareers = careers.map((career) => {
      let skillScore = 0;
      let interestScore = 0;

      // Calculate skill matches
      if (career.requiredSkills) {
        skillScore = career.requiredSkills.reduce((score, skill) => {
          return skills.includes(skill.toLowerCase()) ? score + 1 : score;
        }, 0);
      }

      // Calculate interest matches
      if (interests.length > 0) {
        interestScore = interests.reduce((score: number, interest: string) => {
          return career.description.toLowerCase().includes(interest.toLowerCase()) ? score + 1 : score;
        }, 0);
      }

      // Total score = sum of skill and interest scores
      const totalScore = skillScore + interestScore;

      return { ...career, totalScore };
    });

    // Sort careers by score in descending order
    const sortedCareers = scoredCareers.sort((a, b) => b.totalScore - a.totalScore);

    // Limit results to top 3 careers
    return sortedCareers.slice(0, 3);
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    return [];
  }
};
