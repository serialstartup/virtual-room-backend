import { Router } from 'express';
import { WardrobeController } from '../controllers/wardrobeController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All wardrobe routes require authentication
router.use(authenticateToken);
// Wardrobe routes
router.get('/', WardrobeController.getAllWardrobe);
router.get('/favorites', WardrobeController.getAllFavorites);
router.get('/stats', WardrobeController.getWardrobeStats);
// Toggle actions
router.post('/toggle-like', WardrobeController.toggleLike);
router.post('/toggle-dislike', WardrobeController.toggleDislike);
// CRUD operations
router.post('/:tryOnId', WardrobeController.addToWardrobe);
router.put('/:tryOnId', WardrobeController.updateWardrobe);
router.delete('/:tryOnId', WardrobeController.deleteWardrobe);
export default router;
//# sourceMappingURL=wardrobe.js.map