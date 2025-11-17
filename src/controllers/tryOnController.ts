import type { Request, Response } from "express";
import { tryOnService } from "../services/try-on.js";
import { FashionAIService } from "../services/fashionAI.js";
import { avatarService } from "../services/avatarService.js";
import { APIResponse, CreateAvatarTryOnRequest } from "../types/index.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export class TryOnController {
  static async getTryOns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const tryOns = await tryOnService.getTryOns(userId);

      const response: APIResponse<typeof tryOns> = {
        success: true,
        data: tryOns,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get try-ons error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get try-ons",
      };

      res.status(500).json(response);
    }
  }

  static async getTryOnById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const tryOn = await tryOnService.getTryOn(userId, id);

      const response: APIResponse<typeof tryOn> = {
        success: true,
        data: tryOn,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get try-on error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get try-on",
      };

      res.status(500).json(response);
    }
  }
  static async createTryOn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        self_image,
        model_image,
        avatar_id,
        dress_description,
        dress_image,
        product_url,
      } = req.body;
      const userId = req.user!.userId;

      // Validate input: at least one image source and one dress source
      if (!self_image && !model_image && !avatar_id) {
        res.status(400).json({
          success: false,
          error: "Either self_image, model_image, or avatar_id is required",
        });
        return;
      }

      if (!dress_description && !dress_image && !product_url) {
        res.status(400).json({
          success: false,
          error:
            "At least one dress source (dress_description, dress_image, or product_url) is required",
        });
        return;
      }

      // Handle avatar selection
      let finalModelImage = model_image;
      if (avatar_id) {
        const { avatarService } = await import('../services/avatarService.js');
        const avatar = await avatarService.getAvatarById(userId, avatar_id);
        
        if (avatar.status !== 'completed' || !avatar.avatar_image_url) {
          res.status(400).json({
            success: false,
            error: "Avatar must be completed before use in try-on",
          });
          return;
        }
        
        finalModelImage = avatar.avatar_image_url;
        console.log('[TRYON_CONTROLLER] 👤 Using avatar as model:', {
          avatarId: avatar_id.substring(0, 8) + '...',
          avatarImageUrl: avatar.avatar_image_url.substring(0, 50) + '...'
        });
      }

      // Create try-on record
      const tryOn = await tryOnService.createTryOn(userId, {
        self_image,
        model_image: finalModelImage,
        dress_description,
        dress_image,
        product_url,
      });

      // Start Fashion AI processing (async)
      const modelImageUrl = self_image || finalModelImage;
      const garmentImageUrl = dress_image;

      console.log('[TRYON_CONTROLLER] 🔄 Processing try-on:', {
        userId,
        tryOnId: tryOn.id,
        hasModelImage: !!modelImageUrl,
        hasGarmentImage: !!garmentImageUrl,
        hasDressDescription: !!dress_description
      });

      if (modelImageUrl && garmentImageUrl) {
        // Start Fashion AI processing in background
        FashionAIService.processTryOnRequest(
          userId,
          tryOn.id,
          modelImageUrl,
          garmentImageUrl
        ).catch((error) => {
          console.error("Fashion AI processing failed:", error);
        });
      } else if (modelImageUrl && dress_description) {
        // Text-to-image try-on: Model image + description only
        console.log('[TRYON_CONTROLLER] 🎨 Text-to-image try-on requested:', {
          dressDescription: dress_description,
          modelImageUrl: modelImageUrl.substring(0, 50) + '...'
        });
        
        // Start Fashion AI Model Create + Try-on workflow
        FashionAIService.processTextToImageTryOn(
          userId,
          tryOn.id,
          modelImageUrl,
          dress_description
        ).catch((error) => {
          console.error("Fashion AI text-to-image processing failed:", error);
        });
      } else {
        // Missing required data
        console.log('[TRYON_CONTROLLER] ❌ Insufficient data for try-on:', {
          hasModelImage: !!modelImageUrl,
          hasGarmentImage: !!garmentImageUrl,
          hasDressDescription: !!dress_description
        });
        await tryOnService.updateProcessingStatus(tryOn.id, "failed");
      }

      const response: APIResponse<typeof tryOn> = {
        success: true,
        data: tryOn,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Create try-on error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to create try-on",
      };

      res.status(500).json(response);
    }
  }
  static async deleteTryOn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await tryOnService.deleteTryOn(userId, id);

      const response: APIResponse<null> = {
        success: true,
        data: null,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Delete try-on error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to delete try-on",
      };

      res.status(500).json(response);
    }
  }
  static async getProcessingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      
      const status = await tryOnService.getProcessingStatus(userId, id);

      const response: APIResponse<{ status: string }> = {
        success: true,
        data: { status }
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get try-on status error:", error);
      
      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get try-on status"
      };
      
      res.status(500).json(response);
    }
  }

  static async classicTryOn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        self_image,
        model_image,
        avatar_id,
        dress_description,
        dress_image,
        product_url,
      } = req.body;
      const userId = req.user!.userId;

      // This is essentially the same as the original createTryOn method
      // but specifically labeled as "classic" try-on workflow
      console.log('[TRYON_CONTROLLER] 🎯 Classic try-on request:', {
        userId: userId.substring(0, 8) + '...',
        hasModelImage: !!model_image,
        hasSelfImage: !!self_image,
        hasDressImage: !!dress_image,
        hasDressDescription: !!dress_description
      });

      // Validate input
      if (!self_image && !model_image && !avatar_id) {
        res.status(400).json({
          success: false,
          error: "Either self_image, model_image, or avatar_id is required for classic try-on",
        });
        return;
      }

      if (!dress_description && !dress_image && !product_url) {
        res.status(400).json({
          success: false,
          error: "At least one dress source is required for classic try-on",
        });
        return;
      }

      // Handle avatar selection
      let finalModelImage = model_image;
      if (avatar_id) {
        const { avatarService } = await import('../services/avatarService.js');
        const avatar = await avatarService.getAvatarById(userId, avatar_id);
        
        if (avatar.status !== 'completed' || !avatar.avatar_image_url) {
          res.status(400).json({
            success: false,
            error: "Avatar must be completed before use in classic try-on",
          });
          return;
        }
        
        finalModelImage = avatar.avatar_image_url;
        console.log('[TRYON_CONTROLLER] 👤 Using avatar in classic try-on:', {
          avatarId: avatar_id.substring(0, 8) + '...',
          avatarImageUrl: avatar.avatar_image_url.substring(0, 50) + '...'
        });
      }

      // Create try-on record
      const tryOn = await tryOnService.createTryOn(userId, {
        self_image,
        model_image: finalModelImage,
        dress_description,
        dress_image,
        product_url,
      });

      // Start Fashion AI processing
      const modelImageUrl = self_image || finalModelImage;
      const garmentImageUrl = dress_image;

      if (modelImageUrl && garmentImageUrl) {
        FashionAIService.processTryOnRequest(
          userId,
          tryOn.id,
          modelImageUrl,
          garmentImageUrl
        ).catch((error) => {
          console.error("Classic try-on processing failed:", error);
        });
      } else if (modelImageUrl && dress_description) {
        FashionAIService.processTextToImageTryOn(
          userId,
          tryOn.id,
          modelImageUrl,
          dress_description
        ).catch((error) => {
          console.error("Text-to-image try-on processing failed:", error);
        });
      }

      const response: APIResponse<typeof tryOn> = {
        success: true,
        data: tryOn,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Classic try-on error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to create classic try-on",
      };

      res.status(500).json(response);
    }
  }

  static async productToModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        product_image,
        scene_prompt,
        product_name
      } = req.body;
      const userId = req.user!.userId;

      if (!product_image) {
        res.status(400).json({
          success: false,
          error: "product_image is required for product-to-model",
        });
        return;
      }

      console.log('[TRYON_CONTROLLER] 🛍️ Product-to-model request:', {
        userId: userId.substring(0, 8) + '...',
        productName: product_name,
        hasScenePrompt: !!scene_prompt
      });

      // Create try-on record with product-to-model type
      const tryOn = await tryOnService.createTryOn(userId, {
        dress_image: product_image,
        dress_description: scene_prompt || 'professional model showcase',
        product_url: product_name // Store product name in product_url field
      });

      // Start Product-to-Model Fashion AI processing
      FashionAIService.processProductToModelTryOn(
        userId,
        tryOn.id,
        product_image,
        scene_prompt
      ).catch((error) => {
        console.error("Product-to-model processing failed:", error);
      });

      const response: APIResponse<typeof tryOn> = {
        success: true,
        data: tryOn,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Product-to-model error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to create product-to-model",
      };

      res.status(500).json(response);
    }
  }

  static async textToFashion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        fashion_description,
        scene_prompt
      } = req.body;
      const userId = req.user!.userId;

      if (!fashion_description) {
        res.status(400).json({
          success: false,
          error: "fashion_description is required for text-to-fashion",
        });
        return;
      }

      console.log('[TRYON_CONTROLLER] ✨ Text-to-fashion request:', {
        userId: userId.substring(0, 8) + '...',
        descriptionLength: fashion_description.length,
        hasScenePrompt: !!scene_prompt
      });

      // Combine fashion description with scene prompt if provided
      const fullPrompt = scene_prompt 
        ? `${fashion_description}, ${scene_prompt}`
        : fashion_description;

      // Create custom model for this text-to-fashion request
      const { userModelService } = await import('../services/userModel.js');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const customModel = await userModelService.createUserModel(userId, {
        name: `Text Fashion ${timestamp}-${randomSuffix}`,
        prompt: fullPrompt,
        model_type: 'model-create'
      });

      // Start Fashion AI processing
      FashionAIService.processCustomModelCreation(
        userId,
        customModel.id,
        fullPrompt,
        'model-create'
      ).catch((error) => {
        console.error("Text-to-fashion processing failed:", error);
      });

      const response: APIResponse<{ model: typeof customModel }> = {
        success: true,
        data: { model: customModel },
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Text-to-fashion error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to create text-to-fashion",
      };

      res.status(500).json(response);
    }
  }

  static async avatarTryOn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        avatar_id,
        garment_image_url,
        garment_description,
        try_on_type = 'classic'
      } = req.body as CreateAvatarTryOnRequest;
      
      const userId = req.user!.userId;

      if (!avatar_id) {
        res.status(400).json({
          success: false,
          error: "avatar_id is required for avatar try-on",
        });
        return;
      }

      if (!garment_image_url && !garment_description) {
        res.status(400).json({
          success: false,
          error: "Either garment_image_url or garment_description is required",
        });
        return;
      }

      console.log('[TRYON_CONTROLLER] 👤 Avatar try-on request:', {
        userId: userId.substring(0, 8) + '...',
        avatarId: avatar_id.substring(0, 8) + '...',
        tryOnType: try_on_type,
        hasGarmentImage: !!garment_image_url,
        hasGarmentDescription: !!garment_description
      });

      // Verify avatar exists and belongs to user
      const avatar = await avatarService.getAvatarById(userId, avatar_id);
      
      if (avatar.status !== 'completed' || !avatar.avatar_image_url) {
        res.status(400).json({
          success: false,
          error: "Avatar must be completed before use in try-on",
        });
        return;
      }

      // Create regular try-on using avatar as model image
      const tryOnData: any = {
        model_image: avatar.avatar_image_url
      };

      if (garment_image_url) {
        tryOnData.dress_image = garment_image_url;
      }
      if (garment_description) {
        tryOnData.dress_description = garment_description;
      }

      const tryOn = await tryOnService.createTryOn(userId, tryOnData);

      // Start appropriate Fashion AI processing based on try-on type
      if (try_on_type === 'classic' && garment_image_url) {
        FashionAIService.processTryOnRequest(
          userId,
          tryOn.id,
          avatar.avatar_image_url,
          garment_image_url
        ).catch((error) => {
          console.error("Avatar classic try-on processing failed:", error);
        });
      } else if (try_on_type === 'text-to-fashion' && garment_description) {
        FashionAIService.processTextToImageTryOn(
          userId,
          tryOn.id,
          avatar.avatar_image_url,
          garment_description
        ).catch((error) => {
          console.error("Avatar text-to-fashion processing failed:", error);
        });
      }

      const response: APIResponse<typeof tryOn> = {
        success: true,
        data: tryOn,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Avatar try-on error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to create avatar try-on",
      };

      const statusCode = error.message === 'Avatar not found' ? 404 : 500;
      res.status(statusCode).json(response);
    }
  }

  static async getCredits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const credits = await FashionAIService.getCreditsBalance();

      const response: APIResponse<typeof credits> = {
        success: true,
        data: credits,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get credits error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get credits balance",
      };

      res.status(500).json(response);
    }
  }
}
