import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

const prisma = new PrismaClient();


export const generateRecommendations = async (req: Request, res: Response): Promise<void> => {
    const { skills, interests } = req.body; // Extract user inputs
  
    if (!skills || !Array.isArray(skills)) {
      res.status(400).json({ error: "Skills must be an array of strings." });
      return;
    }
  
    try {
      // Fetch careers from the database
      const careers = await prisma.career.findMany();
  
      // Calculate scores for each career
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
        if (interests && interests.length > 0) {
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
  
      // Limit results to top 1-3 careers
      const recommendations = sortedCareers.slice(0, 3);
  
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  };
  