import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const careers = [
  // 🏥 Healthcare & Medicine
  {
    title: "Cardiologist",
    description: "Diagnoses and treats heart-related diseases.",
    longDescription: "A cardiologist specializes in diagnosing and treating conditions of the cardiovascular system...",
    requiredSkills: ["Medical Knowledge", "Patient Care", "Cardiology"],
    salaryRange: "$200,000 - $400,000",
    industry: "Healthcare & Medicine",
    demand: 9,
    growthPotential: 8,
  },
  {
    title: "Physical Therapist",
    description: "Helps patients recover from injuries and improve mobility.",
    longDescription: "Physical therapists work with patients to restore mobility, relieve pain, and prevent disabilities...",
    requiredSkills: ["Physiotherapy", "Patient Care", "Communication"],
    salaryRange: "$60,000 - $120,000",
    industry: "Healthcare & Medicine",
    demand: 8,
    growthPotential: 7,
  },

  // 📊 Business & Finance
  {
    title: "Investment Banker",
    description: "Manages financial assets and advises clients on investment opportunities.",
    longDescription: "Investment bankers work with corporations, governments, and investors to manage capital and financial strategies...",
    requiredSkills: ["Financial Analysis", "Risk Assessment", "Negotiation"],
    salaryRange: "$100,000 - $300,000",
    industry: "Business & Finance",
    demand: 8,
    growthPotential: 9,
  },
  {
    title: "Supply Chain Manager",
    description: "Oversees procurement, production, and distribution processes.",
    longDescription: "A supply chain manager ensures efficient and cost-effective procurement, production, and delivery of goods...",
    requiredSkills: ["Logistics", "Project Management", "Data Analysis"],
    salaryRange: "$80,000 - $150,000",
    industry: "Business & Finance",
    demand: 7,
    growthPotential: 7,
  },

  // 💻 Technology & Software Development
  {
    title: "Blockchain Developer",
    description: "Builds decentralized applications and blockchain solutions.",
    longDescription: "Blockchain developers work on designing and implementing secure blockchain-based systems...",
    requiredSkills: ["Blockchain", "Cryptography", "Smart Contracts"],
    salaryRange: "$100,000 - $200,000",
    industry: "Technology & Software Development",
    demand: 9,
    growthPotential: 9,
  },
  {
    title: "Cybersecurity Engineer",
    description: "Protects computer systems from cyber threats.",
    longDescription: "Cybersecurity engineers develop and implement security measures to protect networks and systems from attacks...",
    requiredSkills: ["Network Security", "Ethical Hacking", "Penetration Testing"],
    salaryRange: "$90,000 - $180,000",
    industry: "Technology & Software Development",
    demand: 10,
    growthPotential: 9,
  },

  // ⚡ Engineering & Manufacturing
  {
    title: "Aerospace Engineer",
    description: "Designs and develops aircraft and spacecraft.",
    longDescription: "Aerospace engineers focus on developing technology for aviation, defense, and space exploration...",
    requiredSkills: ["Aerodynamics", "Mathematics", "Systems Engineering"],
    salaryRange: "$80,000 - $160,000",
    industry: "Engineering & Manufacturing",
    demand: 8,
    growthPotential: 7,
  },
  {
    title: "Automotive Engineer",
    description: "Designs and develops vehicles and their components.",
    longDescription: "Automotive engineers focus on vehicle mechanics, safety, and efficiency, working on everything from engine performance to aerodynamics...",
    requiredSkills: ["Mechanical Engineering", "CAD", "Automation"],
    salaryRange: "$70,000 - $140,000",
    industry: "Engineering & Manufacturing",
    demand: 7,
    growthPotential: 6,
  },

  // 📚 Education & Research
  {
    title: "Educational Consultant",
    description: "Advises schools, teachers, and students on educational practices.",
    longDescription: "Educational consultants develop strategies to improve learning outcomes and assist institutions with curriculum planning...",
    requiredSkills: ["Teaching", "Communication", "Strategic Planning"],
    salaryRange: "$50,000 - $100,000",
    industry: "Education & Research",
    demand: 7,
    growthPotential: 7,
  },
  {
    title: "Linguist",
    description: "Studies languages and helps with translation and interpretation.",
    longDescription: "Linguists analyze language structures, assist in translation, and conduct research in fields like computational linguistics...",
    requiredSkills: ["Linguistics", "Writing", "Cultural Knowledge"],
    salaryRange: "$40,000 - $90,000",
    industry: "Education & Research",
    demand: 6,
    growthPotential: 6,
  },

  // 🎨 Arts & Media
  {
    title: "Film Director",
    description: "Oversees the production of movies and TV shows.",
    longDescription: "A film director manages all aspects of a movie, from script selection to directing actors and overseeing production teams...",
    requiredSkills: ["Storytelling", "Leadership", "Visual Creativity"],
    salaryRange: "$80,000 - $250,000",
    industry: "Arts & Media",
    demand: 7,
    growthPotential: 8,
  },
  {
    title: "Music Producer",
    description: "Creates and arranges music for recording artists and films.",
    longDescription: "Music producers oversee sound recording, song arrangement, and mixing to create high-quality music productions...",
    requiredSkills: ["Music Theory", "Audio Engineering", "Creativity"],
    salaryRange: "$50,000 - $150,000",
    industry: "Arts & Media",
    demand: 6,
    growthPotential: 7,
  },
];

const updateCareers = async () => {
    for (const career of careers) {
      // Check if career already exists
      const existingCareer = await prisma.career.findFirst({
        where: { title: career.title },
      });
  
      if (existingCareer) {
        // Update existing career
        await prisma.career.update({
          where: { id: existingCareer.id }, // Now using the unique ID
          data: {
            longDescription: career.longDescription,
            requiredSkills: career.requiredSkills,
            industry: career.industry,
            demand: career.demand,
            growthPotential: career.growthPotential,
          },
        });
        console.log(`Updated career: ${career.title}`);
      } else {
        // Create new career
        await prisma.career.create({
          data: career,
        });
        console.log(`Added new career: ${career.title}`);
      }
    }
  };
  
  updateCareers()
    .then(() => {
      console.log("Careers updated successfully!");
      prisma.$disconnect();
    })
    .catch((error) => {
      console.error("Error updating careers:", error);
      prisma.$disconnect();
    });
