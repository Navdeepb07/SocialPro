import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index for efficient queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

// Virtual for conversation participants (sorted for consistency)
messageSchema.virtual('conversationId').get(function() {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    return participants.join('_');
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2) {
    return this.find({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ]
    }).populate('sender receiver', 'name username profilePicture')
      .sort({ createdAt: 1 });
};

// Static method to get unread count for a user
messageSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({ receiver: userId, read: false });
};

// Static method to get conversations for a user
messageSchema.statics.getUserConversations = async function(userId) {
    const conversations = await this.aggregate([
        {
            $match: {
                $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                        then: '$receiver',
                        else: '$sender'
                    }
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: {
                            if: { 
                                $and: [
                                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$read', false] }
                                ]
                            },
                            then: 1,
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'participant'
            }
        },
        {
            $unwind: '$participant'
        },
        {
            $sort: { 'lastMessage.createdAt': -1 }
        }
    ]);

    return conversations;
};

export default mongoose.model('Message', messageSchema);