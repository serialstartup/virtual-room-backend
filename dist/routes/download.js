import { Router } from 'express';
import { DownloadController } from '../controllers/downloadController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Apply authentication middleware to all download routes
router.use(authenticateToken);
const { getDownloadInfo, getDownloadUrl, logDownload, checkDownloadPermissions } = DownloadController;
// Get download information for an image
router.post('/info', getDownloadInfo);
// Get download URL for an image
router.post('/url', getDownloadUrl);
// Log download activity
router.post('/log', logDownload);
// Check download permissions
router.get('/permissions', checkDownloadPermissions);
export default router;
//# sourceMappingURL=download.js.map