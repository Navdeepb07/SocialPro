import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const createIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      `mongodb+srv://bhargavanavdeep:navdeep0708@prodb.gkctzzz.mongodb.net/ProDB?retryWrites=true&w=majority&appName=ProDB`
    );
    console.log("✅ Connected to MongoDB for indexing");

    const db = mongoose.connection.db;

    // User Collection Indexes
    console.log("📚 Creating User indexes...");
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ token: 1 });
    await db.collection('users').createIndex({ active: 1, createAt: -1 });
    await db.collection('users').createIndex({ name: "text", username: "text" });
    console.log("✅ User indexes created");

    // Post Collection Indexes  
    console.log("📝 Creating Post indexes...");
    await db.collection('posts').createIndex({ userId: 1 });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ active: 1, createdAt: -1 });
    await db.collection('posts').createIndex({ likes: -1 });
    await db.collection('posts').createIndex({ body: "text" });
    await db.collection('posts').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('posts').createIndex({ active: 1, userId: 1, createdAt: -1 });
    console.log("✅ Post indexes created");

    // Profile Collection Indexes
    console.log("👤 Creating Profile indexes...");
    await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
    await db.collection('profiles').createIndex({ currentPost: "text", bio: "text" });
    await db.collection('profiles').createIndex({ "skills.skill": 1 });
    console.log("✅ Profile indexes created");

    // Connection Collection Indexes
    console.log("🤝 Creating Connection indexes...");
    await db.collection('connectionrequests').createIndex({ fromUserId: 1 });
    await db.collection('connectionrequests').createIndex({ toUserId: 1 });
    await db.collection('connectionrequests').createIndex({ status: 1 });
    await db.collection('connectionrequests').createIndex({ 
      fromUserId: 1, 
      toUserId: 1 
    }, { unique: true });
    await db.collection('connectionrequests').createIndex({ 
      toUserId: 1, 
      status: 1, 
      createdAt: -1 
    });
    console.log("✅ Connection indexes created");

    // Message Collection Indexes
    console.log("💬 Creating Message indexes...");
    await db.collection('messages').createIndex({ fromUserId: 1 });
    await db.collection('messages').createIndex({ toUserId: 1 });
    await db.collection('messages').createIndex({ createdAt: -1 });
    await db.collection('messages').createIndex({ 
      fromUserId: 1, 
      toUserId: 1, 
      createdAt: -1 
    });
    await db.collection('messages').createIndex({ 
      toUserId: 1, 
      createdAt: -1 
    });
    console.log("✅ Message indexes created");

    // Notification Collection Indexes
    console.log("🔔 Creating Notification indexes...");
    await db.collection('notifications').createIndex({ toUserId: 1 });
    await db.collection('notifications').createIndex({ fromUserId: 1 });
    await db.collection('notifications').createIndex({ isRead: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });
    await db.collection('notifications').createIndex({ 
      toUserId: 1, 
      isRead: 1, 
      createdAt: -1 
    });
    console.log("✅ Notification indexes created");

    // Comment Collection Indexes
    console.log("💭 Creating Comment indexes...");
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('comments').createIndex({ userId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    await db.collection('comments').createIndex({ 
      postId: 1, 
      createdAt: -1 
    });
    console.log("✅ Comment indexes created");

    console.log("\n🎉 All database indexes created successfully!");
    
    // Display index statistics
    const collections = ['users', 'posts', 'profiles', 'connectionrequests', 'messages', 'notifications', 'comments'];
    console.log("\n📊 Index Statistics:");
    
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`${collectionName}: ${indexes.length} indexes`);
      } catch (err) {
        console.log(`${collectionName}: Collection not found (will be created when needed)`);
      }
    }

  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the indexing script
createIndexes();