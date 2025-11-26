import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all feedback routes
router.use(authenticateToken);

const { getFeedback, setFeedback, removeFeedback, getUserFeedbackStats, getUserFeedback } = FeedbackController;

// Get specific feedback for a try-on
router.get('/try-on', getFeedback);

// Set or update feedback
router.post('/try-on', setFeedback);

// Remove feedback
router.delete('/try-on', removeFeedback);

// Get user feedback statistics
router.get('/stats', getUserFeedbackStats);

// Get all user feedback (for analytics)
router.get('/user', getUserFeedback);

export default router;