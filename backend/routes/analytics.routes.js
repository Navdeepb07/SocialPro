import express from 'express';
import { getUserAnalytics } from '../controllers/analytics.controller.js';
import { readLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Analytics routes with rate limiting
router.get('/user/analytics', readLimiter, getUserAnalytics);

export default router;