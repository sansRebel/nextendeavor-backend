import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
import recRoutes from "./routes/recRoutes"
import dialogflowRoutes from "./routes/dialogflowRoutes"
import { authenticateUser } from "./middlewares/authMiddlewares";

const app = express();

app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow frontend requests
      credentials: true, // Allow sending cookies or auth headers
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
      allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    })
);


// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recRoutes);
app.use("/api/user", authenticateUser, userRoutes);
app.use("/api/dialogflow", dialogflowRoutes);

export default app;
