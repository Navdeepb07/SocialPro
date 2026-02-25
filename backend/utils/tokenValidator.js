import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

// Helper function to validate tokens (both old hex tokens and new JWT tokens)
export const validateToken = async (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '' || token === 'undefined' || token === 'null') {
        throw new Error('Invalid token format');
    }

    const cleanToken = token.trim();

    // Check if it's a JWT token (has 3 parts separated by dots)
    if (cleanToken.includes('.') && cleanToken.split('.').length === 3) {
        try {
            // It's a JWT token
            console.log('Attempting to verify JWT token with secret:', process.env.JWT_SECRET ? 'SECRET_SET' : 'NO_SECRET');
            const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key');
            
            if (!decoded.id) {
                console.error('Token decoded but missing id:', decoded);
                throw new Error('Invalid token payload');
            }

            console.log('Token validated successfully for user:', decoded.id);
            return {
                userId: decoded.id,
                email: decoded.email,
                name: decoded.name,
                tokenType: 'jwt'
            };
        } catch (error) {
            console.error('JWT verification failed:', {
                tokenLength: cleanToken.length,
                tokenStart: cleanToken.substring(0, 20) + '...',
                error: error.message,
                errorName: error.name
            });
            
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired - please login again');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid JWT token');
            }
            throw error;
        }
    } else {
        // It's an old hex token - look it up in the database
        try {
            const user = await User.findOne({ token: cleanToken });
            
            if (!user) {
                throw new Error('Invalid or expired token - please login again');
            }

            return {
                userId: user._id,
                email: user.email,
                name: user.name,
                tokenType: 'hex'
            };
        } catch (error) {
            throw new Error('Token validation failed - please login again');
        }
    }
};

// Middleware for token validation
export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.query.token || req.body.token;
        
        if (!token) {
            return res.status(400).json({ 
                message: 'Token is required',
                shouldRelogin: false 
            });
        }

        const userData = await validateToken(token);
        req.user = userData;
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        
        // If it's an old token or expired token, suggest re-login
        const shouldRelogin = error.message.includes('please login again') || 
                            error.message.includes('expired') ||
                            error.message.includes('Invalid or expired token');
        
        return res.status(401).json({ 
            message: error.message,
            shouldRelogin
        });
    }
};