import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const extractRelevantWords = (input: string): string[] => {
  const stopWords = [
    "i", "am", "i'm", "good", "at", "and", "with", "love", "in", "for", "the", "a"
  ];

  return input
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s]/g, "") // Remove punctuation (e.g., periods, commas)
    .split(/\s+/) // Split into words by whitespace
    .filter((word) => !stopWords.includes(word)); // Remove stop words
};


export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters || {};

  console.log("Intent Name:", intentName);
  console.log("Raw Parameters:", parameters);

  try {
    if (intentName === "Career Recommendation") {
      const skills = extractRelevantWords(parameters.skills || "");
      const interests = extractRelevantWords(parameters.interests || "");

      console.log("Extracted Skills:", skills);
      console.log("Extracted Interests:", interests);

      // Fetch careers and calculate scores
      const careers = await prisma.career.findMany();
      const recommendations = careers
        .map((career) => {
          let skillScore = 0;
          let interestScore = 0;

          // Match skills
          if (career.requiredSkills) {
            skillScore = career.requiredSkills.filter((skill) =>
              skills.includes(skill.toLowerCase())
            ).length;
          }

          // Match interests
          if (interests) {
            interestScore = interests.filter((interest) =>
              career.description.toLowerCase().includes(interest.toLowerCase())
            ).length;
          }

          const totalScore = skillScore + interestScore;

          return {
            id: career.id,
            title: career.title,
            description: career.description,
            salaryRange: career.salaryRange,
            demand: career.demand,
            requiredSkills: career.requiredSkills,
            totalScore,
          };
        })
        .filter((career) => career.totalScore > 0) // Exclude careers with no matches
        .sort((a, b) => b.totalScore - a.totalScore) // Sort by score
        .slice(0, 3); // Limit to top 3

      // Format the chatbot's response (simple success message)
      res.json({
        fulfillmentText: "Your career path is generated successfully. You can find it below.",
        fulfillmentMessages: [
          {
            text: {
              text: ["Your career path is generated successfully. You can find it below."],
            },
          },
        ],
        payload: {
          recommendations, // Attach the detailed recommendations for the frontend
        },
      });
      return;
    }

    // Default response for other intents
    res.json({ fulfillmentText: "Sorry, I didn’t understand that request." });
    return;
  } catch (error) {
    console.error("Dialogflow Webhook Error:", error);

    res.status(500).send("Internal Server Error");
    return;
  }
};






