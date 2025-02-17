import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
import recRoutes from "./routes/recRoutes"
import dialogflowRoutes from "./routes/dialogflowRoutes"
import { authenticateUser } from "./middlewares/authMiddlewares";

const app = express();

const allowedOrigins = [
  "https://nextendeavor.vercel.app", // ✅ Allow your Vercel frontend
  "http://localhost:3000" // ✅ Allow local development
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // ✅ Important if using cookies/sessions
    methods: "GET,POST,PUT,DELETE,OPTIONS", // ✅ Specify allowed methods
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
