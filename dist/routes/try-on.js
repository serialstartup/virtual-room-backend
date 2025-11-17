import { Router } from 'express';
import { TryOnController } from '../controllers/tryOnController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// Try-on routes - Legacy
router.post('/create', TryOnController.createTryOn);
// Try-on workflows - New multi-modal approach
router.post('/classic', TryOnController.classicTryOn);
router.post('/product-to-model', TryOnController.productToModel);
router.post('/text-to-fashion', TryOnController.textToFashion);
router.post('/avatar', TryOnController.avatarTryOn);
// General routes
router.get('/credits', TryOnController.getCredits);
router.get('/:id/status', TryOnController.getProcessingStatus);
router.get('/:id', TryOnController.getTryOnById);
router.get('/', TryOnController.getTryOns);
router.delete('/:id', TryOnController.deleteTryOn);
export default router;
//# sourceMappingURL=try-on.js.map