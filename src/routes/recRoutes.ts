import express from 'express';
import { generateRecommendations, saveRecommendation } from '../controllers/recController';
import { authenticateUser } from '../middlewares/authMiddlewares';

const router = express.Router();

router.post("/", generateRecommendations);
router.post("/save", authenticateUser, saveRecommendation);

export default router;