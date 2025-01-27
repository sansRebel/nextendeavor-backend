import express from 'express';
import { generateRecommendations, saveRecommendation } from '../controllers/recController';

const router = express.Router();

router.post("/", generateRecommendations);
router.post("/save", saveRecommendation);

export default router;