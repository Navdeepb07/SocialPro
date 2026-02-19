// News service for fetching real-time news from external APIs
const NEWS_APIS = {
  // Multiple fallback APIs to ensure reliability
  NEWSAPI: 'https://newsapi.org/v2/top-headlines',
  GUARDIAN: 'https://content.guardianapis.com/search',
  BBC: 'https://newsapi.org/v2/everything'
};

// API Keys - In production, these should be in environment variables
const API_KEYS = {
  NEWSAPI: process.env.NEXT_PUBLIC_NEWSAPI_KEY || 'demo-key',
  GUARDIAN: process.env.NEXT_PUBLIC_GUARDIAN_KEY || 'demo-key'
};

class NewsService {
  constructor() {
    // Simple service without caching
  }

  // Fetch tech and business news from NewsAPI
  async fetchNewsAPI() {
    try {
      // Clean the API key to remove any trailing characters
      const apiKey = (API_KEYS.NEWSAPI || 'demo-key').replace(/[^a-zA-Z0-9]/g, '');
      
      const response = await fetch(
        `${NEWS_APIS.NEWSAPI}?category=technology&category=business&country=us&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.articles?.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        readTime: this.estimateReadTime(article.description || article.title)
      })) || [];
    } catch (error) {
      return null;
    }
  }

  // Fetch news from Guardian API
  async fetchGuardianNews() {
    try {
      const response = await fetch(
        `${NEWS_APIS.GUARDIAN}?section=technology&section=business&api-key=${API_KEYS.GUARDIAN}&show-fields=headline,standfirst`
      );
      
      if (!response.ok) {
        throw new Error(`Guardian API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response?.results?.map(article => ({
        title: article.webTitle,
        description: article.fields?.standfirst || '',
        url: article.webUrl,
        publishedAt: article.webPublicationDate,
        source: 'The Guardian',
        readTime: this.estimateReadTime(article.fields?.standfirst || article.webTitle)
      })) || [];
    } catch (error) {
      return null;
    }
  }

  // Fallback news data when APIs are not available
  getFallbackNews() {
    const techTopics = [
      { title: "AI Revolution in Professional Networks", readers: "1,847", time: "2h" },
      { title: "Remote Work Technology Trends 2025", readers: "1,234", time: "4h" },  
      { title: "Cybersecurity for Modern Professionals", readers: "987", time: "6h" },
      { title: "Career Development in Tech Industry", readers: "756", time: "8h" },
      { title: "Professional Skills for Digital Age", readers: "623", time: "12h" }
    ];
    
    // Shuffle array and return random selection
    const shuffled = techTopics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  // Estimate reading time based on character count
  estimateReadTime(text) {
    if (!text) return '1 min read';
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Format article publish time to relative time
  getTimeAgo(publishedAt) {
    if (!publishedAt) return 'Just now';
    
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now - published;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  }

  generateReaderCount() {
    const min = 234;
    const max = 2847;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Main method to fetch news with fallbacks  
  async fetchNews() {
    try {
      // Try NewsAPI first
      let news = await this.fetchNewsAPI();
      
      // If NewsAPI fails, try Guardian
      if (!news || news.length === 0) {
        news = await this.fetchGuardianNews();
      }
      
      // If both APIs fail, use fallback
      if (!news || news.length === 0) {
        return this.getFallbackNews();
      }

      // Transform API news to consistent format
      const transformedNews = news.slice(0, 3).map(article => ({
        title: article.title.length > 60 ? article.title.substring(0, 60) + '...' : article.title,
        time: this.getTimeAgo(article.publishedAt),
        readers: this.generateReaderCount().toLocaleString(),
        url: article.url,
        source: article.source
      }));

      return transformedNews;
      
    } catch (error) {
      return this.getFallbackNews();
    }
  }

  // Get trending topics in professional networks
  async getTrendingTopics() {
    const topics = [
      "#ArtificialIntelligence",
      "#RemoteWork", 
      "#DigitalTransformation",
      "#Cybersecurity",
      "#CareerDevelopment",
      "#Leadership",
      "#Innovation",
      "#Networking"
    ];
    
    // Shuffle and return 3-4 random topics
    const shuffled = topics.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 3);
    
    return selected;
  }
}

// Export singleton instance
const newsService = new NewsService();
export default newsService;