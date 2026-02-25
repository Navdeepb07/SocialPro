import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Check if Redis is enabled
      if (process.env.REDIS_ENABLED !== 'true') {
        console.log('🔌 Redis disabled in configuration');
        return null;
      }

      // Build Redis URL from environment variables
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = process.env.REDIS_PORT || 6379;
      const redisPassword = process.env.REDIS_PASSWORD;
      const redisDb = process.env.REDIS_DB || 0;

      let redisUrl;
      if (process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
      } else {
        redisUrl = `redis://${redisHost}:${redisPort}/${redisDb}`;
        if (redisPassword) {
          redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}/${redisDb}`;
        }
      }

      this.client = createClient({
        url: redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected and ready');
        console.log(`📍 Redis URL: ${redisUrl.replace(/:[^:@]*@/, ':****@')}`); // Hide password in logs
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      console.log('🔄 Falling back to memory store for rate limiting');
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
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;