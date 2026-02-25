# 📱 SocialPro - Professional Social Media Platform

> A full-stack professional networking platform built with Node.js, Express, MongoDB, Next.js, React, and Redux Toolkit

![Tech Stack](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🏗️ Project Architecture

### System Design Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 8080    │    │   Atlas Cloud   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        └──────────────►│     Redis       │◄─────────────┘
                       │   (Caching)     │
                       └─────────────────┘
```

### Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 + React 19 | Server-side rendered React application |
| **State Management** | Redux Toolkit | Centralized state management |
| **Styling** | TailwindCSS + CSS Modules | Utility-first CSS framework |
| **Backend** | Express.js + Node.js | RESTful API server |
| **Database** | MongoDB + Mongoose | NoSQL document database with ODM |
| **Caching** | Redis | Session storage and rate limiting |
| **Authentication** | JWT + Bcrypt | Token-based authentication |
| **File Storage** | Multer + Local Storage | File upload handling |
| **Rate Limiting** | Express Rate Limit | API protection |

## 🚀 Key Features

### Core Functionality
- 🔐 **Authentication System**: JWT-based login/registration with bcrypt password hashing
- 👥 **User Profiles**: Complete profile management with bio, work history, education
- 📝 **Post Management**: Create, read, update, delete posts with media support
- 💬 **Real-time Messaging**: Private messaging system between users
- 🔔 **Notifications**: Real-time notification system for various activities
- 🤝 **Connection System**: Send/accept connection requests, manage professional network
- 📊 **Analytics**: User engagement analytics and insights
- 🛡️ **Security**: Comprehensive rate limiting and input validation

### Advanced Features
- 📄 **PDF Generation**: Resume download functionality
- 🔍 **Discovery Page**: Find and connect with other professionals
- 📱 **Responsive Design**: Mobile-first responsive UI
- ⚡ **Performance**: Redis caching for improved response times
- 🏗️ **Database Indexing**: Optimized MongoDB queries

## 📁 Project Structure

### Backend Architecture (`/backend`)
```
backend/
├── server.js                    # Main server entry point
├── package.json                 # Node.js dependencies and scripts
├── api.http                     # API testing endpoints
├── config/
│   └── redis.js                 # Redis configuration
├── controllers/                 # Business logic layer
│   ├── analytics.controller.js  # Analytics data processing
│   ├── message.controller.js    # Messaging functionality
│   ├── notification.controller.js # Notification management
│   ├── post.controller.js       # Post CRUD operations
│   └── user.controller.js       # User management & auth
├── middleware/
│   └── rateLimiter.js          # API rate limiting middleware
├── models/                     # Database schemas
│   ├── user.models.js          # User data structure
│   ├── profile.models.js       # Extended user profile
│   ├── post.models.js          # Post content & metadata
│   ├── message.models.js       # Private messaging
│   ├── notification.models.js  # Notification system
│   ├── comments.models.js      # Post comments
│   └── connection.models.js    # User connections
├── routes/                     # API endpoint definitions
│   ├── user.routes.js          # User & auth endpoints
│   ├── post.routes.js          # Post management endpoints
│   ├── message.routes.js       # Messaging endpoints
│   ├── notification.routes.js  # Notification endpoints
│   └── analytics.routes.js     # Analytics endpoints
├── scripts/                    # Utility scripts
│   ├── createIndexes.js        # Database index creation
│   ├── testRateLimiting.js     # Rate limit testing
│   └── configCheck.js          # Environment validation
├── uploads/                    # File storage directory
└── utils/
    ├── pagination.js           # Database pagination helpers
    └── tokenValidator.js       # JWT validation utilities
```

### Frontend Architecture (`/socialpro`)
```
socialpro/
├── app/                        # Next.js 13+ app directory
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── Providers.tsx           # Redux store provider
│   ├── componets/              # Reusable components
│   │   ├── DashBoardLayout.jsx # Main dashboard wrapper
│   │   ├── UserLayout.jsx      # User-specific layout
│   │   ├── Navbar.jsx          # Navigation component
│   │   ├── LoginComponent.jsx  # Authentication form
│   │   ├── Loader.jsx          # Loading spinner
│   │   └── NotificationsInterface.jsx # Notification UI
│   ├── dashboard/              # Main dashboard page
│   │   ├── page.jsx            # Dashboard implementation
│   │   └── styles.module.css   # Component-specific styles
│   ├── profile/                # User profile management
│   │   ├── page.jsx            # Profile page
│   │   └── styles.module.css   # Profile styles
│   ├── messaging/              # Private messaging
│   │   ├── page.jsx            # Messaging interface
│   │   └── styles.module.css   # Messaging styles
│   ├── connections/            # Network management
│   │   ├── page.jsx            # Connections page
│   │   └── styles.module.css   # Connection styles
│   ├── discover/               # User discovery
│   │   ├── page.jsx            # Discovery page
│   │   └── styles.module.css   # Discovery styles
│   ├── login/                  # Authentication
│   │   └── page.jsx            # Login page
│   └── utils/
│       └── tokenUtils.js       # JWT handling utilities
├── pages/                      # Legacy pages directory
│   ├── _app.js                 # App wrapper
│   └── view_profile/           # Public profile viewing
│       ├── [username].jsx      # Dynamic profile routes
│       └── profile.module.css  # Profile page styles
├── src/                        # Source code
│   ├── store.js                # Redux store configuration
│   ├── config/                 # Configuration files
│   │   ├── index.jsx           # API base URL
│   │   └── redux/              # Redux setup
│   │       ├── actions/        # Redux actions
│   │       │   ├── authAction/
│   │       │   ├── postAction/
│   │       │   ├── messageAction/
│   │       │   └── notificationAction/
│   │       └── reducer/        # Redux reducers
│   │           ├── authReducer/
│   │           ├── postReducer/
│   │           ├── messageReducer/
│   │           └── notificationReducer/
│   └── services/               # API service layers
│       ├── analyticsService.js # Analytics API calls
│       ├── newsService.js      # News integration
│       └── realTimeService.js  # WebSocket handling
└── public/                     # Static assets
    └── images/                 # Image assets
```

## 🗄️ Database Models

### User Schema
```javascript
{
  name: String,           // Full name
  username: String,       // Unique username
  email: String,          // Unique email (indexed)
  password: String,       // Bcrypt hashed
  profilePicture: String, // File path
  active: Boolean,        // Account status
  token: String,          // Current JWT token
  createAt: Date          // Registration timestamp
}
```

### Profile Schema
```javascript
{
  userId: ObjectId,       // Reference to User
  bio: String,            // User biography
  currentPost: String,    // Current job position
  pastWork: [{            // Work history array
    company: String,
    position: String,
    years: String
  }],
  education: [{           // Education history
    school: String,
    degree: String,
    fieldOfStudy: String
  }]
}
```

### Post Schema
```javascript
{
  userId: ObjectId,       // Post author
  body: String,           // Post content
  likes: Number,          // Like count
  media: String,          // Media file path
  fileType: String,       // Media type
  active: Boolean,        // Post visibility
  createdAt: Date,        // Timestamp
  updatedAt: Date         // Last modified
}
```

### Message Schema
```javascript
{
  sender: ObjectId,       // Message sender
  receiver: ObjectId,     // Message recipient
  content: String,        // Message text
  read: Boolean,          // Read status
  timestamp: Date         // Send time
}
```

### Notification Schema
```javascript
{
  recipient: ObjectId,    // Notification target
  sender: ObjectId,       // Notification source
  type: String,          // Notification type enum
  title: String,         // Notification title
  message: String,       // Notification content
  read: Boolean,         // Read status
  createdAt: Date        // Timestamp
}
```

## 🛣️ API Routes Documentation

### Authentication Routes (`/user.routes.js`)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/register` | Auth Limiter | User registration |
| `POST` | `/login` | Auth Limiter | User authentication |
| `POST` | `/update_profile_picture` | Upload Limiter | Profile picture upload |
| `POST` | `/user_update` | API Limiter | Update user information |
| `GET` | `/get_user_and_profile` | Read Limiter | Get user profile data |

### Post Management (`/post.routes.js`)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/create_post` | Post Limiter | Create new post |
| `GET` | `/get_all_posts` | Read Limiter | Fetch all posts |
| `GET` | `/get_all_posts_paginated` | Read Limiter | Paginated post retrieval |
| `DELETE` | `/delete_post` | API Limiter | Remove user post |
| `POST` | `/comment_post` | API Limiter | Add post comment |
| `POST` | `/increment_likes` | API Limiter | Like/unlike post |

### Messaging System (`/message.routes.js`)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/messages/send` | Message Limiter | Send private message |
| `GET` | `/messages/conversations` | Read Limiter | Get conversation list |
| `GET` | `/messages/conversation` | Read Limiter | Get specific conversation |
| `POST` | `/messages/mark-read` | API Limiter | Mark messages as read |
| `GET` | `/messages/unread-count` | Read Limiter | Get unread message count |

### Notifications (`/notification.routes.js`)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `GET` | `/notifications` | Read Limiter | Get user notifications |
| `POST` | `/notifications/mark-read` | API Limiter | Mark notification as read |
| `GET` | `/notifications/unread-count` | Read Limiter | Get unread notification count |
| `POST` | `/notifications/mark-all-read` | API Limiter | Mark all as read |

### Analytics (`/analytics.routes.js`)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `GET` | `/user/analytics` | Read Limiter | Get user engagement analytics |

### Connection Management
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/user/send_connection_request` | API Limiter | Send connection request |
| `GET` | `/user/getConnectionRequests` | Read Limiter | Get pending requests |
| `POST` | `/user/accept_connection_request` | API Limiter | Accept/reject connection |
| `GET` | `/user/get_all_connections` | Read Limiter | Get user's connections |

## 🎨 Frontend Pages & Components

### Core Pages
1. **Dashboard** (`/dashboard`)
   - Main feed with posts from connections
   - Create new posts with media upload
   - Like and comment on posts
   - Real-time updates

2. **Profile** (`/profile`)
   - Personal profile management
   - Edit bio, work history, education
   - Profile picture upload
   - Resume generation

3. **Messaging** (`/messaging`)
   - Private messaging interface
   - Conversation list
   - Real-time message updates
   - Message status indicators

4. **Connections** (`/connections`)
   - Manage connection requests
   - View sent/received requests
   - Browse connected users
   - Connection recommendations

5. **Discover** (`/discover`)
   - Browse all platform users
   - Send connection requests
   - User search functionality

6. **Login** (`/login`)
   - Authentication interface
   - User registration
   - Password validation

### Key Components
- **UserLayout**: Main application wrapper with navigation
- **DashBoardLayout**: Dashboard-specific layout
- **Navbar**: Navigation with notifications and messaging
- **NotificationsInterface**: Real-time notification center
- **Loader**: Loading state indicators

## 🔧 Redux State Management

### Store Configuration
```javascript
configureStore({
  reducer: {
    auth: authReducer,           // User authentication state
    posts: postReducer,          // Post management state
    messages: messageReducer,    // Messaging state
    notifications: notificationReducer // Notification state
  }
});
```

### State Structure
- **Auth State**: User login, profile, connections, all users
- **Posts State**: Post list, comments, loading states
- **Messages State**: Conversations, current messages, unread counts  
- **Notifications State**: Notification list, unread counts

## 🛡️ Security Features

### Rate Limiting Strategy
| Type | Limit | Window | Purpose |
|------|-------|---------|---------|
| `authLimiter` | 5 requests | 15 minutes | Login/registration protection |
| `postLimiter` | 10 requests | 1 hour | Post creation rate limiting |
| `uploadLimiter` | 5 requests | 1 hour | File upload protection |
| `messageLimiter` | 20 requests | 1 hour | Message sending limits |
| `readLimiter` | 100 requests | 1 minute | Read operation limits |
| `apiLimiter` | 15 requests | 15 minutes | General API protection |

### Authentication
- JWT token-based authentication
- Bcrypt password hashing with salt rounds
- Token validation middleware
- Automatic token refresh handling

### Data Protection
- Input validation on all endpoints
- MongoDB injection prevention with Mongoose
- File upload restrictions and validation
- CORS configuration for cross-origin requests

## ⚙️ Environment Configuration

### Backend Environment Variables
```env
NODE_ENV=development
RATE_LIMITING_ENABLED=true
REDIS_ENABLED=true
DB_INDEXES_CREATED=true
AUTH_LIMIT_MAX_REQUESTS=5
POST_LIMIT_MAX_REQUESTS=10
UPLOAD_LIMIT_MAX_REQUESTS=5
MESSAGE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_MAX_REQUESTS=15
READ_LIMIT_MAX_REQUESTS=100
```

### Database Connection
- MongoDB Atlas cloud database
- Connection string with retry writes
- Automatic reconnection handling
- Database indexing for performance

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis server (optional)
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Create database indexes
npm run db:index

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd socialpro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build frontend
npm run build

# Start production servers
npm run prod  # Backend
npm start     # Frontend
```

## 📊 Performance Features

### Database Optimization
- MongoDB indexes on frequently queried fields
- Cursor-based pagination for large datasets
- Aggregation pipelines for complex queries
- Connection pooling for optimal resource usage

### Caching Strategy
- Redis caching for session management
- Rate limiting with Redis store
- Memory store fallback for Redis unavailability

### Frontend Optimization
- Next.js server-side rendering
- Code splitting with dynamic imports
- Image optimization
- CSS modules for scoped styling

## 🧪 Testing & Development

### Available Scripts

#### Backend
```bash
npm run dev          # Development server with nodemon
npm run start        # Production server
npm run db:index     # Create database indexes
npm run config:check # Validate configuration
npm test:rate-limits # Test rate limiting
```

#### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # Code linting
```

### Development Tools
- Nodemon for backend hot reloading
- ESLint for code quality
- Prettier for code formatting
- API testing with REST client

## 🎯 Interview Highlights

### Technical Proficiency Demonstrated
1. **Full-Stack Development**: Complete MERN stack implementation
2. **Database Design**: Relational modeling in NoSQL environment
3. **API Design**: RESTful API with proper HTTP methods and status codes
4. **State Management**: Complex Redux store with multiple slices
5. **Security**: Multi-layered security with rate limiting and authentication
6. **Performance**: Optimized database queries and caching strategies
7. **Modern React**: Next.js 13+ app directory and React 19 features
8. **TypeScript**: Type safety in frontend development

### Architecture Decisions
- **Microservice-ready**: Modular controller/service architecture
- **Scalable database**: MongoDB with proper indexing and pagination
- **Real-time features**: WebSocket integration groundwork
- **Production-ready**: Environment configuration and deployment scripts

### Code Quality
- **Clean Code**: Organized file structure and naming conventions
- **Error Handling**: Comprehensive error handling and validation
- **Documentation**: Detailed inline comments and API documentation
- **Testing**: Unit test structure and rate limiting tests

## 📞 Contact & Support

For questions about this project or technical discussions during interviews, please refer to the detailed code comments and documentation within each file.

---

*This project demonstrates proficiency in modern full-stack web development with a focus on scalability, security, and user experience.*