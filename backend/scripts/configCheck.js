import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 SocialPro Backend Configuration Check\n');

const checkConfig = () => {
  console.log('📊 Environment Variables:');
  console.log(`  └─ RATE_LIMITING_ENABLED: ${process.env.RATE_LIMITING_ENABLED}`);
  console.log(`  └─ REDIS_ENABLED: ${process.env.REDIS_ENABLED}`);
  console.log(`  └─ MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`  └─ NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  └─ PORT: ${process.env.PORT || 8080}\n`);

  console.log('🛡️  Rate Limiting Configuration:');
  if (process.env.RATE_LIMITING_ENABLED === 'true') {
    console.log('  ✅ Rate limiting is ENABLED');
    console.log(`  ├─ Auth Limit: ${process.env.AUTH_LIMIT_MAX_REQUESTS}/15min`);
    console.log(`  ├─ Post Limit: ${process.env.POST_LIMIT_MAX_REQUESTS}/hour`);
    console.log(`  ├─ Upload Limit: ${process.env.UPLOAD_LIMIT_MAX_REQUESTS}/hour`);
    console.log(`  ├─ Message Limit: ${process.env.MESSAGE_LIMIT_MAX_REQUESTS}/hour`);
    console.log(`  ├─ API Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS}/15min`);
    console.log(`  └─ Read Limit: ${process.env.READ_LIMIT_MAX_REQUESTS}/min`);
  } else {
    console.log('  ❌ Rate limiting is DISABLED');
    console.log('  💡 Set RATE_LIMITING_ENABLED=true to enable');
  }

  console.log('\n🔗 Redis Configuration:');
  if (process.env.REDIS_ENABLED === 'true') {
    console.log('  ✅ Redis is ENABLED');
    console.log(`  ├─ Host: ${process.env.REDIS_HOST || 'localhost'}`);
    console.log(`  ├─ Port: ${process.env.REDIS_PORT || 6379}`);
    console.log(`  ├─ Database: ${process.env.REDIS_DB || 0}`);
    console.log(`  └─ Password: ${process.env.REDIS_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  } else {
    console.log('  ❌ Redis is DISABLED');
    console.log('  💡 Set REDIS_ENABLED=true to enable caching');
  }

  console.log('\n📚 Cache TTL Settings:');
  console.log(`  ├─ User Data: ${process.env.CACHE_USER_DATA_TTL || 3600}s`);
  console.log(`  ├─ Posts: ${process.env.CACHE_POSTS_TTL || 900}s`);
  console.log(`  ├─ Connections: ${process.env.CACHE_CONNECTIONS_TTL || 1800}s`);
  console.log(`  ├─ Comments: ${process.env.CACHE_COMMENTS_TTL || 600}s`);
  console.log(`  └─ Profile: ${process.env.CACHE_PROFILE_TTL || 2700}s`);

  console.log('\n📋 Next Steps:');
  if (!process.env.MONGODB_URI) {
    console.log('  ❌ Set MONGODB_URI in .env file');
  }
  if (process.env.RATE_LIMITING_ENABLED !== 'true') {
    console.log('  ⚠️  Consider enabling rate limiting for production');
  }
  if (process.env.REDIS_ENABLED === 'true') {
    console.log('  💡 Make sure Redis server is running');
  }
  console.log('  🚀 Start server: npm run dev');
  console.log('  📊 Test rate limits: npm run test:rate-limits');
  console.log('  🗄️  Create indexes: npm run db:index');
};

checkConfig();