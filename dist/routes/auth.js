import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
const router = Router();
const { login, logout, signup, me } = AuthController;
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', me);
export default router;
//# sourceMappingURL=auth.js.map