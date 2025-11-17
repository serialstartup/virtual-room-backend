import { Router } from 'express';
import { getModels, getModelById } from '../controllers/models.js';
const router = Router();
// GET /api/models - Get all available models
router.get('/', getModels);
// GET /api/models/:id - Get specific model by ID
router.get('/:id', getModelById);
export default router;
//# sourceMappingURL=models.js.map