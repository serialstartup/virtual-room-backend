import { Router } from 'express';
import { AvatarController } from '../controllers/avatarController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/avatars - Create a new avatar
router.post('/', AvatarController.createAvatar);

// GET /api/avatars - Get all user's avatars
router.get('/', AvatarController.getAvatars);

// GET /api/avatars/primary - Get user's primary avatar
router.get('/primary', AvatarController.getPrimaryAvatar);

// GET /api/avatars/:id - Get specific avatar by ID
router.get('/:id', AvatarController.getAvatarById);

// PUT /api/avatars/:id - Update avatar
router.put('/:id', AvatarController.updateAvatar);

// DELETE /api/avatars/:id - Delete avatar
router.delete('/:id', AvatarController.deleteAvatar);

// GET /api/avatars/:id/status - Get avatar processing status
router.get('/:id/status', AvatarController.getAvatarStatus);

// POST /api/avatars/:id/retry - Retry failed avatar creation
router.post('/:id/retry', AvatarController.retryAvatar);

// POST /api/avatars/:id/set-primary - Set avatar as primary
router.post('/:id/set-primary', AvatarController.setPrimaryAvatar);

export default router;