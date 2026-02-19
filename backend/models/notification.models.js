import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['connection_request', 'connection_accepted', 'new_post', 'post_like', 'post_comment', 'message']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
    const notification = new this(data);
    await notification.save();
    await notification.populate('sender', 'name username profilePicture');
    return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({ recipient: userId, read: false });
};

export default mongoose.model('Notification', notificationSchema);