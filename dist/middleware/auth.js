import { AuthService } from '../services/auth.js';
export const authenticateToken = async (req, res, next) => {
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
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: error.message || 'Geçersiz token'
            });
            return;
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Token doğrulama başarısız'
        });
    }
};
//# sourceMappingURL=auth.js.map