import express from 'express';
import { proxyImage } from '../controllers/imageController.js';
const router = express.Router();
// GET /api/images/proxy?url=https://cdn.fashn.ai/...
router.get('/proxy', proxyImage);
export default router;
//# sourceMappingURL=images.js.map