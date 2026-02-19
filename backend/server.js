import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config();

const app = express();
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
    await mongoose.connect(
      `mongodb+srv://bhargavanavdeep:navdeep0708@prodb.gkctzzz.mongodb.net/ProDB?retryWrites=true&w=majority&appName=ProDB`
    );

    console.log("✅ MongoDB Connected");

    app.listen(8080, () => {
      console.log("🚀 Server running on port 8080");
    });

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

start();
