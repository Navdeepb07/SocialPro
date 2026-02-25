import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8080}`;

console.log('🧪 Testing Rate Limiting Configuration...\n');

const testEndpoint = async (url, method = 'GET', data = null, expectedLimit = null) => {
  try {
    console.log(`Testing: ${method} ${url}`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 5000,
      validateStatus: () => true, // Don't throw on rate limit errors
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.status === 429) {
      console.log(`  ✅ Rate limit active (${response.status}): ${response.data?.message || 'Rate limited'}`);
      if (response.headers['x-ratelimit-limit']) {
        console.log(`  📊 Limit: ${response.headers['x-ratelimit-limit']} requests`);
        console.log(`  ⏰ Window: ${response.headers['x-ratelimit-window']}ms`);
        console.log(`  🔢 Remaining: ${response.headers['x-ratelimit-remaining']}`);
      }
    } else if (response.status < 400) {
      console.log(`  ✅ Endpoint accessible (${response.status})`);
      if (response.headers['x-ratelimit-limit']) {
        console.log(`  📊 Rate limit headers present - Limit: ${response.headers['x-ratelimit-limit']}`);
      }
    } else {
      console.log(`  ⚠️  Response: ${response.status} - ${response.data?.message || 'Unknown error'}`);
    }
    
    console.log('');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ Server not running at ${BASE_URL}`);
      console.log('  💡 Start server with: npm run dev\n');
      return false;
    }
    console.log(`  ❌ Error: ${error.message}\n`);
  }
  return true;
};

const runTests = async () => {
  console.log(`🎯 Target Server: ${BASE_URL}\n`);
  
  // Test if server is running
  const serverRunning = await testEndpoint('/', 'GET');
  if (!serverRunning) return;

  // Test rate limited endpoints
  console.log('🛡️  Testing Rate Limited Endpoints:\n');
  
  // Authentication endpoints (strict limits)
  await testEndpoint('/login', 'POST', { email: 'test@test.com', password: 'test' });
  await testEndpoint('/register', 'POST', { 
    name: 'Test', 
    email: 'test@test.com', 
    password: 'test',
    username: 'test' 
  });
  
  // Post endpoints
  await testEndpoint('/post', 'POST', { body: 'Test post', token: 'fake-token' });
  await testEndpoint('/posts', 'GET');
  await testEndpoint('/posts/paginated', 'GET');
  await testEndpoint('/posts/feed', 'GET');
  
  // Message endpoints
  await testEndpoint('/messages/send', 'POST', { 
    toUserId: 'fake-id', 
    message: 'test',
    token: 'fake-token' 
  });
  await testEndpoint('/messages/conversations', 'GET');
  
  // Notification endpoints  
  await testEndpoint('/notifications', 'GET');
  await testEndpoint('/notifications/unread-count', 'GET');
  
  // User endpoints
  await testEndpoint('/get_user_and_profile', 'GET');
  await testEndpoint('/user/get_all_users', 'GET');
  
  console.log('✨ Rate limiting test completed!\n');
  console.log('📋 Configuration Summary:');
  console.log(`  Rate Limiting: ${process.env.RATE_LIMITING_ENABLED === 'true' ? 'Enabled ✅' : 'Disabled ❌'}`);
  console.log(`  Redis: ${process.env.REDIS_ENABLED === 'true' ? 'Enabled ✅' : 'Disabled ❌'}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.RATE_LIMITING_ENABLED === 'true') {
    console.log('\n🛡️  Active Rate Limits:');
    console.log(`  • Authentication: ${process.env.AUTH_LIMIT_MAX_REQUESTS} requests/15min`);
    console.log(`  • Posts: ${process.env.POST_LIMIT_MAX_REQUESTS} requests/hour`);  
    console.log(`  • Uploads: ${process.env.UPLOAD_LIMIT_MAX_REQUESTS} requests/hour`);
    console.log(`  • Messages: ${process.env.MESSAGE_LIMIT_MAX_REQUESTS} requests/hour`);
    console.log(`  • API: ${process.env.RATE_LIMIT_MAX_REQUESTS} requests/15min`);
    console.log(`  • Reads: ${process.env.READ_LIMIT_MAX_REQUESTS} requests/min`);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test terminated by user');
  process.exit(0);
});

runTests().catch(console.error);