import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

export const saveRecommendation = async(req: Request, res: Response): Promise<void> =>{
    const userId = req.userId;
    const {careerId} = req.body;
    console.log(careerId);

    if(!userId){
        res.status(401).json({ error: "Unauthorized personnel"});
        return;
    }

    if(!careerId){
        res.status(400).json({error: "Career ID is required"});
        return;
    }


    try {
    // Check if the career exists
    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career) {
        res.status(404).json({ error: "Career not found" });
        return;
        }

        // Check if the recommendation already exists for this user and career
        const existingRecommendation = await prisma.recommendation.findFirst({
        where: { userId, careerId },
        });

        if (existingRecommendation) {
        res.status(400).json({ error: "Recommendation already saved" });
        return;
        }

        // Save the recommendation
        const recommendation = await prisma.recommendation.create({
        data: {
            userId,
            careerId,
            saved: true, // Mark as saved
        },
        });

        res.status(201).json({
        message: "Recommendation saved successfully",
        recommendation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getSavedRecommendations = async(req: Request, res: Response): Promise<void> =>{
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        try {
            // Fetch saved recommendations for the user
            const savedRecommendations = await prisma.recommendation.findMany({
            where: {
                userId,
                saved: true, // Only fetch saved recommendations
            },
            include: {
                career: true, // Include career details
            },
            });
        
            if (savedRecommendations.length === 0) {
            res.status(404).json({ error: "No saved recommendations found" });
            return;
            }
        
            // Format the response
            const recommendations = savedRecommendations.map((rec) => ({
            id: rec.id,
            careerId: rec.careerId,
            title: rec.career.title,
            description: rec.career.description,
            requiredSkills: rec.career.requiredSkills,
            salaryRange: rec.career.salaryRange,
            demand: rec.career.demand,
            savedAt: rec.createdAt,
            }));
        
            res.status(200).json({ recommendations });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch saved recommendations" });
        }
};

export const clearRecommendations = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId; // Extract userId from JWT middleware

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Check if the user has any saved recommendations
        const existingRecommendations = await prisma.recommendation.findMany({
            where: { userId, saved: true },
        });

        if (existingRecommendations.length === 0) {
            res.status(404).json({ error: "No saved recommendations found to clear." });
            return;
        }

        // Delete all saved recommendations for this user
        await prisma.recommendation.deleteMany({
            where: { userId },
        });

        res.status(200).json({ message: "All saved recommendations have been cleared." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to clear recommendations" });
    }
};
