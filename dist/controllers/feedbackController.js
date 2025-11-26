import { FeedbackService } from "../services/feedbackService.js";
import { z } from "zod";
const setFeedbackSchema = z.object({
    try_on_id: z.string().uuid(),
    try_on_type: z.enum(['classic', 'avatar', 'text-to-fashion', 'product-to-model']),
    feedback_type: z.enum(['like', 'dislike', 'neutral']),
    feedback_source: z.enum(['heart', 'thumbs'])
});
const getFeedbackSchema = z.object({
    try_on_id: z.string().uuid(),
    feedback_source: z.enum(['heart', 'thumbs'])
});
export class FeedbackController {
    // Get existing feedback for a try-on
    static async getFeedback(req, res) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[FEEDBACK_CONTROLLER] 📖 Get feedback started - RequestID: ${requestId}`);
        try {
            const { try_on_id, feedback_source } = getFeedbackSchema.parse(req.query);
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const feedback = await FeedbackService.getFeedback(userId, try_on_id, feedback_source);
            console.log(`✅ [FEEDBACK_CONTROLLER] Feedback retrieved - RequestID: ${requestId}`, {
                tryOnId: try_on_id,
                feedbackSource: feedback_source,
                found: !!feedback
            });
            res.status(200).json({
                success: true,
                feedback
            });
        }
        catch (error) {
            console.error(`❌ [FEEDBACK_CONTROLLER] Error - RequestID: ${requestId}:`, error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Invalid request parameters', details: error.issues });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Set or update feedback
    static async setFeedback(req, res) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[FEEDBACK_CONTROLLER] 💾 Set feedback started - RequestID: ${requestId}`);
        try {
            const { try_on_id, try_on_type, feedback_type, feedback_source } = setFeedbackSchema.parse(req.body);
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const feedback = await FeedbackService.setFeedback(userId, try_on_id, try_on_type, feedback_source, feedback_type);
            console.log(`✅ [FEEDBACK_CONTROLLER] Feedback set - RequestID: ${requestId}`, {
                tryOnId: try_on_id,
                tryOnType: try_on_type,
                feedbackType: feedback_type,
                feedbackSource: feedback_source
            });
            res.status(200).json({
                success: true,
                feedback
            });
        }
        catch (error) {
            console.error(`❌ [FEEDBACK_CONTROLLER] Error - RequestID: ${requestId}:`, error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Invalid request body', details: error.issues });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Remove feedback
    static async removeFeedback(req, res) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[FEEDBACK_CONTROLLER] 🗑️ Remove feedback started - RequestID: ${requestId}`);
        try {
            const { try_on_id, feedback_source } = getFeedbackSchema.parse(req.query);
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            await FeedbackService.removeFeedback(userId, try_on_id, feedback_source);
            console.log(`✅ [FEEDBACK_CONTROLLER] Feedback removed - RequestID: ${requestId}`, {
                tryOnId: try_on_id,
                feedbackSource: feedback_source
            });
            res.status(200).json({
                success: true,
                message: 'Feedback removed successfully'
            });
        }
        catch (error) {
            console.error(`❌ [FEEDBACK_CONTROLLER] Error - RequestID: ${requestId}:`, error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Invalid request parameters', details: error.issues });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get user feedback statistics
    static async getUserFeedbackStats(req, res) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[FEEDBACK_CONTROLLER] 📊 Get user feedback stats started - RequestID: ${requestId}`);
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const stats = await FeedbackService.getUserFeedbackStats(userId);
            console.log(`✅ [FEEDBACK_CONTROLLER] User feedback stats retrieved - RequestID: ${requestId}`);
            res.status(200).json({
                success: true,
                stats
            });
        }
        catch (error) {
            console.error(`❌ [FEEDBACK_CONTROLLER] Error - RequestID: ${requestId}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get all user feedback (for analytics)
    static async getUserFeedback(req, res) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[FEEDBACK_CONTROLLER] 📋 Get user feedback started - RequestID: ${requestId}`);
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const feedback = await FeedbackService.getUserFeedback(userId);
            console.log(`✅ [FEEDBACK_CONTROLLER] User feedback retrieved - RequestID: ${requestId}`, {
                count: feedback.length
            });
            res.status(200).json({
                success: true,
                feedback
            });
        }
        catch (error) {
            console.error(`❌ [FEEDBACK_CONTROLLER] Error - RequestID: ${requestId}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
//# sourceMappingURL=feedbackController.js.map