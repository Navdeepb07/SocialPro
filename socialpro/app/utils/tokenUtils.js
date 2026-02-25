// Token utility functions for handling JWT/legacy token transitions

export const isJWT = (token) => {
    if (!token || typeof token !== 'string') return false;
    // JWT tokens have three parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
};

export const shouldRefreshToken = (token) => {
    if (!token) return true;
    
    // If it's not a JWT token, it's an old hex token - needs refresh
    if (!isJWT(token)) {
        return true;
    }
    
    try {
        // Check if JWT is expired or invalid
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // If token is expired or expires within 1 hour, refresh it
        if (payload.exp && payload.exp < currentTime + 3600) {
            return true;
        }
        
        return false;
    } catch (error) {
        // If we can't parse the token, it's invalid - needs refresh
        return true;
    }
};

export const clearOldToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear any other auth-related items
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
};

export const getValidToken = () => {
    const token = localStorage.getItem('token');
    
    console.log('Getting token from localStorage:', {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        tokenStart: token ? token.substring(0, 20) + '...' : 'null',
        isJWT: token ? isJWT(token) : false
    });
    
    if (shouldRefreshToken(token)) {
        console.log('Token needs refresh, clearing and returning null');
        clearOldToken();
        return null;
    }
    
    console.log('Returning valid token');
    return token;
};

export const handleAuthError = (error) => {
    console.log('Checking if error is auth related:', {
        error,
        status: error?.response?.status,
        message: error?.message,
        errorType: typeof error
    });
    
    // If we get JWT malformed or authentication errors
    if (error?.response?.status === 401 || 
        error?.response?.status === 500 ||
        error?.message?.includes('JWT') ||
        error?.message?.includes('malformed') ||
        error?.message?.includes('Invalid JWT token') ||
        error?.message?.includes('Token expired')) {
        
        console.log('Authentication error detected, clearing tokens...');
        clearOldToken();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
            console.log('Redirecting to login page');
            window.location.href = '/login';
        }
        
        return true; // Indicates error was handled
    }
    
    return false; // Indicates error was not an auth error
};