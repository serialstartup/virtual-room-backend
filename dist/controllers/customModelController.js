import { userModelService } from "../services/userModel.js";
import { FashionAIService } from "../services/fashionAI.js";
export class CustomModelController {
    static async createModel(req, res) {
        try {
            const { name, prompt, model_type, product_image } = req.body;
            const userId = req.user.userId;
            // Validate input
            if (!name || !prompt || !model_type) {
                res.status(400).json({
                    success: false,
                    error: "Name, prompt, and model_type are required",
                });
                return;
            }
            if (!['model-create', 'product-to-model'].includes(model_type)) {
                res.status(400).json({
                    success: false,
                    error: "model_type must be either 'model-create' or 'product-to-model'",
                });
                return;
            }
            if (model_type === 'product-to-model' && !product_image) {
                res.status(400).json({
                    success: false,
                    error: "product_image is required for product-to-model type",
                });
                return;
            }
            console.log('[CUSTOM_MODEL_CONTROLLER] 🎨 Creating custom model:', {
                userId: userId.substring(0, 8) + '...',
                name,
                modelType: model_type,
                promptLength: prompt.length,
                hasProductImage: !!product_image
            });
            // Create model record in database
            const userModel = await userModelService.createUserModel(userId, {
                name,
                prompt,
                model_type,
                product_image
            });
            // Start Fashion AI processing in background
            FashionAIService.processCustomModelCreation(userId, userModel.id, prompt, model_type, product_image).catch((error) => {
                console.error("Fashion AI custom model processing failed:", error);
            });
            const response = {
                success: true,
                data: userModel,
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error("Create custom model error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to create custom model",
            };
            res.status(500).json(response);
        }
    }
    static async getModels(req, res) {
        try {
            const userId = req.user.userId;
            console.log('[CUSTOM_MODEL_CONTROLLER] 📋 Fetching user models for:', userId.substring(0, 8) + '...');
            const models = await userModelService.getUserModels(userId);
            const response = {
                success: true,
                data: models,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get custom models error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get custom models",
            };
            res.status(500).json(response);
        }
    }
    static async getModelById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[CUSTOM_MODEL_CONTROLLER] 🔍 Fetching model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: id.substring(0, 8) + '...'
            });
            const model = await userModelService.getUserModelById(userId, id);
            const response = {
                success: true,
                data: model,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get custom model error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get custom model",
            };
            const statusCode = error.message === 'Model not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async updateModel(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const userId = req.user.userId;
            if (!name) {
                res.status(400).json({
                    success: false,
                    error: "Name is required",
                });
                return;
            }
            console.log('[CUSTOM_MODEL_CONTROLLER] ✏️ Updating model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: id.substring(0, 8) + '...',
                newName: name
            });
            const updatedModel = await userModelService.updateUserModel(userId, id, { name });
            const response = {
                success: true,
                data: updatedModel,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Update custom model error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to update custom model",
            };
            const statusCode = error.message === 'Model not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async deleteModel(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[CUSTOM_MODEL_CONTROLLER] 🗑️ Deleting model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: id.substring(0, 8) + '...'
            });
            await userModelService.deleteUserModel(userId, id);
            const response = {
                success: true,
                data: null,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Delete custom model error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to delete custom model",
            };
            const statusCode = error.message === 'Model not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async getModelStatus(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[CUSTOM_MODEL_CONTROLLER] 🔄 Checking model status:', {
                userId: userId.substring(0, 8) + '...',
                modelId: id.substring(0, 8) + '...'
            });
            const model = await userModelService.getUserModelById(userId, id);
            const response = {
                success: true,
                data: {
                    status: model.status,
                    image_url: model.image_url
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error("Get model status error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to get model status"
            };
            const statusCode = error.message === 'Model not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
    static async retryModel(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            console.log('[CUSTOM_MODEL_CONTROLLER] 🔄 Retrying model creation:', {
                userId: userId.substring(0, 8) + '...',
                modelId: id.substring(0, 8) + '...'
            });
            // Get the model details
            const model = await userModelService.getUserModelById(userId, id);
            if (model.status === 'processing') {
                res.status(400).json({
                    success: false,
                    error: "Model is already processing",
                });
                return;
            }
            if (model.status === 'completed') {
                res.status(400).json({
                    success: false,
                    error: "Model is already completed",
                });
                return;
            }
            // Reset status to processing
            await userModelService.updateModelStatus(model.id, 'processing');
            // Start Fashion AI processing again
            const productImage = model.model_type === 'product-to-model' ? model.prompt : undefined;
            FashionAIService.processCustomModelCreation(userId, model.id, model.prompt, model.model_type, productImage).catch((error) => {
                console.error("Fashion AI custom model retry failed:", error);
            });
            const response = {
                success: true,
                data: { message: "Model creation retried successfully" }
            };
            res.json(response);
        }
        catch (error) {
            console.error("Retry model error:", error);
            const response = {
                success: false,
                error: error.message || "Failed to retry model creation",
            };
            const statusCode = error.message === 'Model not found' ? 404 : 500;
            res.status(statusCode).json(response);
        }
    }
}
//# sourceMappingURL=customModelController.js.map