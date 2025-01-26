import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("api/user", userRoutes);

export default app;
