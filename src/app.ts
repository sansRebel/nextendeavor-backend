import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
import recRoutes from "./routes/recRoutes"
import dialogflowRoutes from "./routes/dialogflowRoutes"
import { authenticateUser } from "./middlewares/authMiddlewares";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recRoutes);
app.use("/api/user", authenticateUser, userRoutes);
app.use("/api/dialogflow", dialogflowRoutes);

export default app;
