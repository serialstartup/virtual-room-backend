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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token gereklidir'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = AuthService.verifyJWT(token);
      
      // Add user info to request object
      (req as AuthenticatedRequest).user = decoded;
      
      next();
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Geçersiz token'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Token doğrulama başarısız'
    });
  }
};