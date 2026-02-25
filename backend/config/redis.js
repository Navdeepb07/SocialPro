import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (process.env.REDIS_ENABLED !== "true") {
        console.log("🔌 Redis disabled in configuration");
        return null;
      }

      let redisUrl;

      if (process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
      } else {
        const redisHost = process.env.REDIS_HOST || "127.0.0.1";
        const redisPort = process.env.REDIS_PORT || 6379;
        const redisPassword = process.env.REDIS_PASSWORD;
        const redisDb = process.env.REDIS_DB || 0;

        if (redisPassword) {
          redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}/${redisDb}`;
        } else {
          redisUrl = `redis://${redisHost}:${redisPort}/${redisDb}`;
        }
      }

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.log("❌ Redis retry attempts exhausted");
              return new Error("Retry attempts exhausted");
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      // Event listeners
      this.client.on("error", (err) => {
        console.error("❌ Redis Client Error:", err.message);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("🔗 Redis connecting...");
      });

      this.client.on("ready", () => {
        console.log("✅ Redis connected and ready");
        console.log(
          `📍 Redis URL: ${redisUrl.replace(/:[^:@]*@/, ":****@")}`
        );
        this.isConnected = true;
      });

      this.client.on("end", () => {
        console.log("🔌 Redis connection closed");
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("❌ Redis connection failed:", error.message);
      console.log("🔄 Falling back to memory store");
      this.isConnected = false;
      return null;
    }
  }

  getClient() {
    return this.client;
  }

  isReady() {
    return this.isConnected && this.client?.isReady;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log("🔌 Redis disconnected");
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;