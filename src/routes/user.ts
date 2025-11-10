import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// User routes
router.get('/all', UserController.getAllUsers);
router.put('/update', UserController.updateUser);
router.delete('/delete', UserController.deleteUser);

// User settings routes (must be before /:userId)
router.get('/settings', UserController.getUserSettings);
router.put('/settings', UserController.updateUserSettings);
router.get('/settings/notifications', UserController.getNotificationSettings);

// Dynamic route must be last
router.get('/:userId', UserController.getUser);




export default router;