import express from 'express';
import { getUserAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

// Analytics routes
router.get('/user/analytics', getUserAnalytics);

export default router;