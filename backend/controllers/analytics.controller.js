import User from '../models/user.models.js';
import ConnectionRequest from '../models/connection.models.js';
import Post from '../models/post.models.js';
import { validateToken } from '../utils/tokenValidator.js';

// Get user analytics
export const getUserAnalytics = async (req, res) => {
    try {
        const { userId, token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const requesterId = userData.userId;

        // Use the user from token if userId not provided
        const targetUserId = userId || requesterId;

        // Get user data
        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get connections count
        const connectionsCount = await ConnectionRequest.countDocuments({
            $or: [
                { requester: targetUserId, status: true },
                { recipient: targetUserId, status: true }
            ]
        });

        // Get posts count
        const postsCount = await Post.countDocuments({ userId: targetUserId });

        // Generate analytics data (similar to frontend service)
        const profileViews = Math.max(15, Math.floor(connectionsCount * 0.3) + Math.floor(Math.random() * 25) + Math.floor(Math.random() * 10));
        const postImpressions = postsCount > 0 ? Math.floor((100 + connectionsCount * 2.5 + Math.floor(connectionsCount * 0.1 * 3) + Math.floor(Math.random() * 500) + Math.floor(Math.random() * 200)) * postsCount) : 0;
        const searchAppearances = 5 + Math.floor(connectionsCount * 0.1) + (user.bio ? 10 : 0) + Math.floor(Math.random() * 15);
        const engagementRate = postImpressions > 0 ? Math.min((profileViews / postImpressions) * 100, 12.5) : 0;

        // Generate weekly trends
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyTrends = days.map(day => ({
            day,
            views: Math.floor(Math.random() * 20) + 5,
            searches: Math.floor(Math.random() * 8) + 1
        }));

        const analytics = {
            profileViews,
            postImpressions,
            searchAppearances,
            engagementRate: engagementRate.toFixed(1),
            weeklyTrends,
            lastUpdated: new Date().toISOString(),
            profileViewsChange: Math.floor(Math.random() * 20) - 10,
            impressionsChange: Math.floor(Math.random() * 30) - 15,
            topViewingSources: [
                { source: 'LinkedIn Search', percentage: 45 },
                { source: 'Your Network', percentage: 30 },
                { source: 'Groups', percentage: 15 },
                { source: 'Direct Traffic', percentage: 10 }
            ]
        };

        res.status(200).json({
            success: true,
            analytics,
            data: 'Analytics retrieved successfully'
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};