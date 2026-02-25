import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

// Create rate limiting middleware with fallback to memory store
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes default
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    },
  };

  // Use Redis store if available and enabled, fallback to memory
  if (process.env.REDIS_ENABLED === 'true' && redisClient.isReady()) {
    defaultOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.getClient().sendCommand(args),
    });
  }

  return rateLimit({ ...defaultOptions, ...options });
};

// Check if rate limiting is enabled
const isRateLimitingEnabled = () => {
  return process.env.RATE_LIMITING_ENABLED === 'true';
};

// Create a bypass middleware if rate limiting is disabled
const createConditionalLimiter = (limiter) => {
  return (req, res, next) => {
    if (isRateLimitingEnabled()) {
      return limiter(req, res, next);
    }
    next();
  };
};

// Authentication rate limiter - strict
export const authLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.AUTH_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_LIMIT_MAX_REQUESTS) || 5,
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login/register attempts. Please try again in 15 minutes.',
  },
}));

// Post creation limiter
export const postLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.POST_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.POST_LIMIT_MAX_REQUESTS) || 10,
  message: {
    error: 'Post creation limit exceeded',
    message: 'You can only create 10 posts per hour. Please wait.',
  },
}));

// File upload limiter
export const uploadLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.UPLOAD_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.UPLOAD_LIMIT_MAX_REQUESTS) || 5,
  message: {
    error: 'Upload limit exceeded',
    message: 'You can only upload 5 files per hour. Please wait.',
  },
}));

// Messaging limiter
export const messageLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.MESSAGE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.MESSAGE_LIMIT_MAX_REQUESTS) || 50,
  message: {
    error: 'Message limit exceeded',
    message: 'You can only send 50 messages per hour. Please wait.',
  },
}));

// General API limiter
export const apiLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'API rate limit exceeded',
    message: 'Too many API requests. Please slow down.',
  },
}));

// Light limiter for read operations
export const readLimiter = createConditionalLimiter(createRateLimiter({
  windowMs: parseInt(process.env.READ_LIMIT_WINDOW_MS) || 1 * 60 * 1000,
  max: parseInt(process.env.READ_LIMIT_MAX_REQUESTS) || 60,
  message: {
    error: 'Read limit exceeded',
    message: 'Too many read requests. Please wait a moment.',
  },
}));

export default {
  authLimiter,
  postLimiter,
  uploadLimiter,
  messageLimiter,
  apiLimiter,
  readLimiter,
};