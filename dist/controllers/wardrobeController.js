import { wardrobeService } from '../services/wardrobe.js';
export class WardrobeController {
    static async getAllWardrobe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            const filter = req.query.filter;
            const wardrobe = await wardrobeService.getWardrobe(userId, filter);
            const response = {
                success: true,
                data: wardrobe
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get all wardrobe error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to get wardrobe'
            };
            res.status(500).json(response);
        }
    }
    static async getAllFavorites(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            const favorites = await wardrobeService.getFavorites(userId);
            const response = {
                success: true,
                data: favorites
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get all favorites error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to get favorites'
            };
            res.status(500).json(response);
        }
    }
    static async getWardrobeStats(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            const stats = await wardrobeService.getUserStats(userId);
            const response = {
                success: true,
                data: stats
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get wardrobe stats error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to get wardrobe stats'
            };
            res.status(500).json(response);
        }
    }
    static async toggleLike(req, res) {
        try {
            const userId = req.user?.userId;
            const { try_on_id } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            if (!try_on_id) {
                res.status(400).json({
                    success: false,
                    error: 'try_on_id is required'
                });
                return;
            }
            const wardrobe = await wardrobeService.toggleLike(userId, try_on_id);
            const response = {
                success: true,
                data: wardrobe
            };
            res.json(response);
        }
        catch (error) {
            console.error('Toggle like error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to toggle like'
            };
            res.status(500).json(response);
        }
    }
    static async toggleDislike(req, res) {
        try {
            const userId = req.user?.userId;
            const { try_on_id } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            if (!try_on_id) {
                res.status(400).json({
                    success: false,
                    error: 'try_on_id is required'
                });
                return;
            }
            const wardrobe = await wardrobeService.toggleDislike(userId, try_on_id);
            const response = {
                success: true,
                data: wardrobe
            };
            res.json(response);
        }
        catch (error) {
            console.error('Toggle dislike error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to toggle dislike'
            };
            res.status(500).json(response);
        }
    }
    static async deleteWardrobe(req, res) {
        try {
            const userId = req.user?.userId;
            const { tryOnId } = req.params;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            if (!tryOnId) {
                res.status(400).json({
                    success: false,
                    error: 'tryOnId is required'
                });
                return;
            }
            await wardrobeService.removeFromWardrobe(userId, tryOnId);
            const response = {
                success: true,
                data: null
            };
            res.json(response);
        }
        catch (error) {
            console.error('Delete wardrobe item error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to delete wardrobe item'
            };
            res.status(500).json(response);
        }
    }
    static async addToWardrobe(req, res) {
        try {
            const userId = req.user?.userId;
            const { tryOnId } = req.params;
            const { liked } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            if (!tryOnId) {
                res.status(400).json({
                    success: false,
                    error: 'tryOnId is required'
                });
                return;
            }
            const wardrobe = await wardrobeService.addToWardrobe(userId, tryOnId, liked);
            const response = {
                success: true,
                data: wardrobe
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Add to wardrobe error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to add to wardrobe'
            };
            res.status(500).json(response);
        }
    }
    static async updateWardrobe(req, res) {
        try {
            const userId = req.user?.userId;
            const { tryOnId } = req.params;
            const { liked } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
                return;
            }
            if (!tryOnId) {
                res.status(400).json({
                    success: false,
                    error: 'tryOnId is required'
                });
                return;
            }
            const wardrobe = await wardrobeService.updateWardrobeItem(userId, tryOnId, { liked });
            const response = {
                success: true,
                data: wardrobe
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update wardrobe item error:', error);
            const response = {
                success: false,
                error: error.message || 'Failed to update wardrobe item'
            };
            res.status(500).json(response);
        }
    }
}
//# sourceMappingURL=wardrobeController.js.map