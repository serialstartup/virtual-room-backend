import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.js';
import type { AuthenticatedRequest } from '../types/auth.js';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('[AUTH_MIDDLEWARE] 🔍 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
      method: req.method,
      url: req.url
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH_MIDDLEWARE] ❌ No valid auth header');
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const token = authHeader.substring(7);
    console.log('[AUTH_MIDDLEWARE] 🎫 Token extracted:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });
    
    try {
      const decoded = AuthService.verifyJWT(token);
      console.log('[AUTH_MIDDLEWARE] ✅ Token verified:', {
        userId: decoded.userId,
        email: decoded.email
      });
      
      // Add user info to request object
      (req as AuthenticatedRequest).user = decoded;
      
      next();
    } catch (error: any) {
      console.log('[AUTH_MIDDLEWARE] ❌ Token verification failed:', error.message);
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] 🚨 Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};