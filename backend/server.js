import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import redisClient from './config/redis.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config();

const app = express();

// Apply global rate limiting (controlled by environment variable)
if (process.env.RATE_LIMITING_ENABLED === 'true') {
  app.use(apiLimiter);
}

app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(postRoutes);
app.use(messageRoutes);
app.use(notificationRoutes);
app.use(analyticsRoutes);
app.use(express.static('uploads'));

const start = async () => {
  try {
    // Initialize Redis connection (non-blocking)
    if (process.env.REDIS_ENABLED === 'true') {
      redisClient.connect().catch(err => {
        console.log("⚠️  Redis connection failed, using memory store for rate limiting:", err.message);
      });
    } else {
      console.log("🔌 Redis disabled in configuration");
    }

    await mongoose.connect(
      `mongodb+srv://bhargavanavdeep:navdeep0708@prodb.gkctzzz.mongodb.net/ProDB?retryWrites=true&w=majority&appName=ProDB`
    );

    console.log("✅ MongoDB Connected");

    app.listen(8080, () => {
      console.log("🚀 Server running on port 8080");
      console.log("📊 Configuration Status:");
      console.log(`  └─ Rate Limiting: ${process.env.RATE_LIMITING_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`  └─ Redis: ${process.env.REDIS_ENABLED === 'true' ? (redisClient.isReady() ? '✅ Connected' : '🔄 Connecting') : '❌ Disabled'}`);
      console.log(`  └─ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  └─ Database Indexes: ${process.env.DB_INDEXES_CREATED ? '✅ Created' : '⚠️  Run: npm run db:index'}`);
      
      if (process.env.RATE_LIMITING_ENABLED === 'true') {
        console.log("🛡️  Rate Limits Active:");
        console.log(`  ├─ Authentication: ${process.env.AUTH_LIMIT_MAX_REQUESTS}/15min`);
        console.log(`  ├─ Posts: ${process.env.POST_LIMIT_MAX_REQUESTS}/hour`);
        console.log(`  ├─ Uploads: ${process.env.UPLOAD_LIMIT_MAX_REQUESTS}/hour`);
        console.log(`  ├─ Messages: ${process.env.MESSAGE_LIMIT_MAX_REQUESTS}/hour`);
        console.log(`  ├─ API: ${process.env.RATE_LIMIT_MAX_REQUESTS}/15min`);
        console.log(`  └─ Reads: ${process.env.READ_LIMIT_MAX_REQUESTS}/min`);
      }
    });

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

start();
