// Analytics service for dynamic profile statistics
class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache
  }

  // Check if cached data is still valid
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  getCached(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Set cache data
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Generate realistic profile view count based on various factors
  generateProfileViews(user, connections = 0) {
    const baseViews = 15; // Minimum views
    const connectionMultiplier = Math.floor(connections * 0.3); // 30% of connections view profile
    const randomFactor = Math.floor(Math.random() * 25); // Random daily views
    const weeklyVariation = Math.floor(Math.random() * 10); // Weekly variation
    
    return Math.max(baseViews, connectionMultiplier + randomFactor + weeklyVariation);
  }

  // Generate post impression count based on follower count and engagement
  generatePostImpressions(user, posts = 0, connections = 0) {
    if (posts === 0) return 0;
    
    const baseImpressions = 100; // Minimum impressions per post
    const connectionMultiplier = connections * 2.5; // Each connection generates 2.5 impressions on average
    const networkEffect = Math.floor(connections * 0.1 * 3); // Network of networks effect
    const contentQuality = Math.floor(Math.random() * 500); // Content quality factor
    const timeDecay = Math.floor(Math.random() * 200); // Recent posts get more views
    
    const totalImpressions = Math.floor(
      (baseImpressions + connectionMultiplier + networkEffect + contentQuality + timeDecay) * posts
    );
    
    return Math.max(baseImpressions * posts, totalImpressions);
  }

  // Generate search appearances
  generateSearchAppearances(user, connections = 0) {
    const baseSearches = 5;
    const connectionFactor = Math.floor(connections * 0.1);
    const profileCompleteness = user.bio ? 10 : 0; // Profiles with bio get more searches
    const randomFactor = Math.floor(Math.random() * 15);
    
    return baseSearches + connectionFactor + profileCompleteness + randomFactor;
  }

  // Calculate engagement rate
  calculateEngagementRate(profileViews, postImpressions) {
    if (postImpressions === 0) return 0;
    const rate = (profileViews / postImpressions) * 100;
    return Math.min(rate, 12.5); // Cap at realistic 12.5%
  }

  // Get analytics for backend API call
  async fetchAnalyticsFromBackend(userId, token) {
    try {
      // Build query params manually for fetch API
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (token) params.append('token', token);
      
      const response = await fetch(`http://localhost:8080/user/analytics?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.analytics;
      }
    } catch (error) {
      console.log('Analytics API not available, generating realistic data');
    }
    return null;
  }

  // Generate weekly trend data
  generateWeeklyTrends() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      views: Math.floor(Math.random() * 20) + 5,
      searches: Math.floor(Math.random() * 8) + 1
    }));
  }

  // Main method to get user analytics
  async getUserAnalytics(user, connections = [], posts = []) {
    const userId = user.userId?._id || user._id;
    const cacheKey = `analytics-${userId}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      // Try to fetch from backend first
      const token = localStorage.getItem('token');
      const backendAnalytics = await this.fetchAnalyticsFromBackend(userId, token);
      
      if (backendAnalytics) {
        this.setCache(cacheKey, backendAnalytics);
        return backendAnalytics;
      }
    } catch (error) {
      console.log('Using generated analytics data');
    }

    // Generate realistic analytics
    const connectionCount = connections.length || 0;
    const postCount = posts.length || 0;
    
    const profileViews = this.generateProfileViews(user, connectionCount);
    const postImpressions = this.generatePostImpressions(user, postCount, connectionCount);
    const searchAppearances = this.generateSearchAppearances(user, connectionCount);
    const engagementRate = this.calculateEngagementRate(profileViews, postImpressions);
    
    const analytics = {
      profileViews,
      postImpressions,
      searchAppearances,
      engagementRate: engagementRate.toFixed(1),
      weeklyTrends: this.generateWeeklyTrends(),
      lastUpdated: new Date().toISOString(),
      // Additional metrics
      profileViewsChange: Math.floor(Math.random() * 20) - 10, // -10 to +10 change
      impressionsChange: Math.floor(Math.random() * 30) - 15, // -15 to +15 change
      topViewingSources: [
        { source: 'LinkedIn Search', percentage: 45 },
        { source: 'Your Network', percentage: 30 },
        { source: 'Groups', percentage: 15 },
        { source: 'Direct Traffic', percentage: 10 }
      ]
    };
    
    this.setCache(cacheKey, analytics);
    return analytics;
  }

  // Get company/industry insights
  async getIndustryInsights(userIndustry = 'Technology') {
    const cacheKey = `industry-${userIndustry}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    const insights = {
      industry: userIndustry,
      averageProfileViews: Math.floor(Math.random() * 50) + 20,
      industryGrowth: (Math.random() * 10 + 2).toFixed(1) + '%',
      topSkills: [
        'Leadership',
        'Strategic Planning', 
        'Digital Marketing',
        'Data Analysis',
        'Project Management'
      ].sort(() => 0.5 - Math.random()).slice(0, 3),
      networkingOpportunities: Math.floor(Math.random() * 25) + 10
    };
    
    this.setCache(cacheKey, insights);
    return insights;
  }

  // Format large numbers for display
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Calculate performance score
  calculatePerformanceScore(analytics) {
    const { profileViews, postImpressions, searchAppearances, engagementRate } = analytics;
    
    // Weight different metrics
    const viewsScore = Math.min(profileViews / 100 * 25, 25); // Max 25 points
    const impressionsScore = Math.min(postImpressions / 2000 * 25, 25); // Max 25 points
    const searchScore = Math.min(searchAppearances / 30 * 25, 25); // Max 25 points
    const engagementScore = Math.min(parseFloat(engagementRate) / 10 * 25, 25); // Max 25 points
    
    const totalScore = viewsScore + impressionsScore + searchScore + engagementScore;
    return Math.min(Math.round(totalScore), 100);
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;