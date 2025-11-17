import { avatarService } from "../services/avatarService.js";
import { FashionAIService } from "../services/fashionAI.js";
export class AvatarController {
    static async createAvatar(req, res) {
        try {
            const { name, face_image_url } = req.body;
            const userId = req.user.userId;
            // Validate input
            if (!name || !face_image_url) {
                res.status(400).json({
                    success: false,
                    error: "Name and face_image_url are required",
                });
                return;
            }
            console.log('[AVATAR_CONTROLLER] 👤 Creating avatar:', {
                userId: userId.substring(0, 8) + '...',
                name,
                faceImageUrl: face_image_url.substring(0, 50) + '...'
            });
            // Create avatar record in database
            const avatar = await avatarService.createAvatar(userId, {
                name,
                face_image_url
            });
            // Start Fashion AI processing in background
            FashionAIService.processAvatarCreation(userId, avatar.id, face_image_url).catch((error) => {
                console.error("Fashion AI avatar creation failed:", error);
            });
            const response = {
                success: true,
                data: avatar,
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error("Create avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to create avatar",
            };
            res.status(500).json(response);
        }
    }
    static async getAvatars(req, res) {
        try {
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 📋 Fetching avatars for:', userId.substring(0, 8) + '...');
            const avatars = await avatarService.getUserAvatars(userId);
            const response = {
                success: true,
                data: avatars,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get avatars error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get avatars",
            };
            res.status(500).json(response);
        }
    }
    static async getAvatarById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🔍 Fetching avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...'
            });
            const avatar = await avatarService.getAvatarById(userId, id);
            const response = {
                success: true,
                data: avatar,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get avatar",
            };
            const statusCode = error.message === 'Avatar not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async updateAvatar(req, res) {
        try {
            const { id } = req.params;
            const { name, is_primary } = req.body;
            const userId = req.user.userId;
            if (!name && is_primary === undefined) {
                res.status(400).json({
                    success: false,
                    error: "At least one field (name or is_primary) is required",
                });
                return;
            }
            console.log('[AVATAR_CONTROLLER] ✏️ Updating avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...',
                name,
                isPrimary: is_primary
            });
            let updatedAvatar;
            if (is_primary === true) {
                // Use special method for setting primary avatar
                updatedAvatar = await avatarService.setPrimaryAvatar(userId, id);
                // Also update name if provided
                if (name) {
                    updatedAvatar = await avatarService.updateAvatar(userId, id, { name });
                }
            }
            else {
                // Regular update
                const updates = {};
                if (name)
                    updates.name = name;
                if (is_primary !== undefined)
                    updates.is_primary = is_primary;
                updatedAvatar = await avatarService.updateAvatar(userId, id, updates);
            }
            const response = {
                success: true,
                data: updatedAvatar,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Update avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to update avatar",
            };
            const statusCode = error.message === 'Avatar not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async deleteAvatar(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🗑️ Deleting avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...'
            });
            await avatarService.deleteAvatar(userId, id);
            const response = {
                success: true,
                data: null,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Delete avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to delete avatar",
            };
            let statusCode = 500;
            if (error.message === 'Avatar not found') {
                statusCode = 404;
            }
            else if (error.message?.includes('Cannot delete primary avatar')) {
                statusCode = 400;
            }
            res.status(statusCode).json(response);
        }
    }
    static async getAvatarStatus(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🔄 Checking avatar status:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...'
            });
            const avatar = await avatarService.getAvatarById(userId, id);
            const response = {
                success: true,
                data: {
                    status: avatar.status,
                    avatar_image_url: avatar.avatar_image_url
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get avatar status error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get avatar status"
            };
            const statusCode = error.message === 'Avatar not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async retryAvatar(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🔄 Retrying avatar creation:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...'
            });
            // Get the avatar details
            const avatar = await avatarService.getAvatarById(userId, id);
            if (avatar.status === 'processing') {
                res.status(400).json({
                    success: false,
                    error: "Avatar is already processing",
                });
                return;
            }
            if (avatar.status === 'completed') {
                res.status(400).json({
                    success: false,
                    error: "Avatar is already completed",
                });
                return;
            }
            // Reset status to processing
            await avatarService.updateAvatarStatus(avatar.id, 'processing');
            // Start Fashion AI processing again
            FashionAIService.processAvatarCreation(userId, avatar.id, avatar.face_image_url).catch((error) => {
                console.error("Fashion AI avatar retry failed:", error);
            });
            const response = {
                success: true,
                data: { message: "Avatar creation retried successfully" }
            };
            res.json(response);
        }
        catch (error) {
            console.error("Retry avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to retry avatar creation",
            };
            const statusCode = error.message === 'Avatar not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async getPrimaryAvatar(req, res) {
        try {
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🎯 Fetching primary avatar for:', userId.substring(0, 8) + '...');
            const avatar = await avatarService.getPrimaryAvatar(userId);
            if (!avatar) {
                res.status(404).json({
                    success: false,
                    error: "No primary avatar found"
                });
                return;
            }
            const response = {
                success: true,
                data: avatar,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get primary avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get primary avatar",
            };
            res.status(500).json(response);
        }
    }
    static async setPrimaryAvatar(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[AVATAR_CONTROLLER] 🎯 Setting primary avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: id.substring(0, 8) + '...'
            });
            const avatar = await avatarService.setPrimaryAvatar(userId, id);
            const response = {
                success: true,
                data: avatar,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Set primary avatar error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to set primary avatar",
            };
            let statusCode = 500;
            if (error.message === 'Avatar not found') {
                statusCode = 404;
            }
            else if (error.message?.includes('Cannot set incomplete avatar')) {
                statusCode = 400;
            }
            res.status(statusCode).json(response);
        }
    }
}
//# sourceMappingURL=avatarController.js.map