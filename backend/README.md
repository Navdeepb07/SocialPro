# SocialPro Backend

A high-performance Node.js backend for the SocialPro social media platform with Redis caching, rate limiting, and database optimization.

## 🚀 Features

- **Rate Limiting**: Multi-tier rate limiting for optimal security and performance
- **Redis Caching**: Optional Redis integration for enhanced performance
- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Pagination**: Both offset and cursor-based pagination support
- **File Uploads**: Secure file upload with rate limiting
- **Real-time Features**: Messaging and notifications
- **Analytics**: User engagement analytics

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Create database indexes (one-time setup)
npm run db:index
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
MONGODB_URI=your_mongodb_connection_string
PORT=8080

# Optional (Redis for enhanced performance)
REDIS_URL=redis://localhost:6379
ENABLE_RATE_LIMITING=true
```

### Redis Setup (Optional)

Redis is optional but recommended for production. If Redis is not available, the system will fall back to memory-based rate limiting.

**Windows:**
```bash
# Install Redis via Chocolatey
choco install redis-64

# Start Redis
redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

## 🏃‍♂️ Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Create database indexes
npm run db:index
```

## 📊 Performance Features

### Rate Limiting

- **Authentication**: 5 requests/15min
- **Post Creation**: 10 requests/hour
- **File Uploads**: 5 uploads/hour
- **Messaging**: 50 messages/hour
- **General API**: 100 requests/15min
- **Read Operations**: 60 requests/minute

### Database Indexes

Optimized indexes for:
- User authentication and profile lookups
- Post timeline and user-specific queries
- Message threads and notifications
- Connection requests and relationships
- Full-text search capabilities

### Pagination Support

#### Offset Pagination
```javascript
GET /posts/paginated?page=1&limit=10
```

#### Cursor Pagination (Real-time feeds)
```javascript
GET /posts/feed?cursor=2024-01-01T00:00:00.000Z&limit=10
```

## 🛡️ Security Features

- Rate limiting with Redis store
- Input validation and sanitization
- Secure file upload handling
- Environment-based configuration
- Error handling without information leakage

## 📈 API Endpoints

### Posts
- `GET /posts` - Get all posts (original)
- `GET /posts/paginated` - Get paginated posts
- `GET /posts/feed` - Get cursor-paginated feed
- `POST /post` - Create new post (rate limited)

### Users
- `POST /login` - User login (strict rate limiting)
- `POST /register` - User registration (strict rate limiting)
- `GET /get_user_and_profile` - Get user profile

### Messages
- `POST /messages/send` - Send message (rate limited)
- `GET /messages/conversations` - Get conversations
- `GET /messages/conversation` - Get specific conversation

### Notifications
- `GET /notifications` - Get notifications
- `POST /notifications/mark-read` - Mark notification as read

## 🔧 Maintenance

### Database Indexing
Run the indexing script after any schema changes:
```bash
npm run db:index
```

### Monitor Performance
- Redis connection status shown on startup
- Rate limiting status displayed
- Database query optimization via indexes

## 📋 Backwards Compatibility

All new features are designed to maintain backwards compatibility:
- Original endpoints remain unchanged
- New paginated endpoints added alongside existing ones
- Rate limiting can be disabled via environment variables
- Redis is optional with graceful fallback

## 🚨 Troubleshooting

### Redis Connection Issues
If Redis fails to connect, the application will:
- Display a warning message
- Fall back to memory-based rate limiting
- Continue operating normally

### Performance Issues
1. Ensure database indexes are created: `npm run db:index`
2. Monitor Redis connection status
3. Check rate limiting configuration
4. Verify MongoDB connection string

## 📝 Development Notes

- Use `.lean()` queries for better performance
- Implement cursor pagination for real-time feeds
- Apply appropriate rate limiting to each endpoint type
- Monitor Redis cache hit rates in production