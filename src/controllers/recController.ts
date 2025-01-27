import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

const prisma = new PrismaClient();


export const generateRecommendations = async (req: Request, res: Response): Promise<void> =>{
    const {skills, interests} = req.body;

    if (!skills || !Array.isArray(skills)) {
        res.status(400).json({error: "Skills must be an array of strings"});
        return;
    }

    try {
        const careers = await prisma.career.findMany();

        const recommendations = careers.filter((career)=>{
            const matchesSkills = career.requiredSkills.some((skill)=>
            skills.includes(skill.toLowerCase())
        );
        const matchesInterests = interests
        ? interests.some((interest: string) =>
            career.description.toLowerCase().includes(interest.toLowerCase())
            )
            : false;

        return matchesSkills || matchesInterests;
        });

    res.status(200).json({ recommendations });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to generate recommendations" });
        
    }
}