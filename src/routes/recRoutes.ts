import express from 'express';
import { generateRecommendations, saveRecommendation, getSavedRecommendations } from '../controllers/recController';
import { authenticateUser } from '../middlewares/authMiddlewares';

const router = express.Router();

router.post("/", generateRecommendations);
router.post("/save", authenticateUser, saveRecommendation);
router.get("/saved", authenticateUser, getSavedRecommendations);

export default router;