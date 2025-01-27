import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
import { authenticateUser } from "./middlewares/authMiddlewares";
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authenticateUser, userRoutes);

export default app;
