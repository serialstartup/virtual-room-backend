import { Router } from 'express';
import { CustomModelController } from '../controllers/customModelController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Apply authentication middleware to all routes
router.use(authenticateToken);
// POST /api/custom-models - Create a new custom model
router.post('/', CustomModelController.createModel);
// GET /api/custom-models - Get all user's custom models
router.get('/', CustomModelController.getModels);
// GET /api/custom-models/:id - Get specific custom model by ID
router.get('/:id', CustomModelController.getModelById);
// PUT /api/custom-models/:id - Update custom model (name only)
router.put('/:id', CustomModelController.updateModel);
// DELETE /api/custom-models/:id - Delete custom model
router.delete('/:id', CustomModelController.deleteModel);
// GET /api/custom-models/:id/status - Get model processing status
router.get('/:id/status', CustomModelController.getModelStatus);
// POST /api/custom-models/:id/retry - Retry failed model creation
router.post('/:id/retry', CustomModelController.retryModel);
export default router;
//# sourceMappingURL=customModels.js.map