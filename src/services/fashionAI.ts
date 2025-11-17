import { tryOnService } from './try-on.js';
import { userModelService } from './userModel.js';
import { ImageUtils } from '../utils/imageUtils.js';

interface FashionAIRequest {
  model_name: string
  inputs: {
    model_image: string
    garment_image: string
    output_format?: string
    return_base64?: boolean
  }
}

interface ModelCreateRequest {
  model_name: string
  inputs: {
    prompt: string
    output_format?: string
    return_base64?: boolean
  }
}

interface ProductToModelRequest {
  model_name: string
  inputs: {
    product_image: string
    model_image?: string
    prompt?: string
    output_format?: string
    return_base64?: boolean
  }
}

interface FaceToModelRequest {
  model_name: string
  inputs: {
    face_image: string
    output_format?: string
    return_base64?: boolean
  }
}

interface FashionAIResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output_url?: string
  error?: string
}

export class FashionAIService {
  private static readonly API_URL = 'https://api.fashn.ai/v1/run';
  private static readonly API_KEY = process.env.FASHION_AI_API_KEY || 'fa-GEJWLBMOUzc9-L7TWnZBt0rHmNTWV7gZeSr62';

  static async createTryOn(
    modelImageUrl: string,
    garmentImageUrl: string
  ): Promise<{ requestId: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Fashion AI API key not configured');
      }

      console.log('[FASHION_AI] 🔄 Preparing images for API:', {
        modelImageUrl: modelImageUrl.substring(0, 50) + '...',
        garmentImageUrl: garmentImageUrl.substring(0, 50) + '...',
        modelIsLocal: ImageUtils.isLocalFilePath(modelImageUrl),
        garmentIsLocal: ImageUtils.isLocalFilePath(garmentImageUrl)
      });

      // Convert local file paths to base64 if needed
      const processedModelImage = await ImageUtils.prepareImageForAPI(modelImageUrl);
      const processedGarmentImage = await ImageUtils.prepareImageForAPI(garmentImageUrl);

      const requestBody: FashionAIRequest = {
        model_name: "tryon-v1.6",
        inputs: {
          model_image: processedModelImage,
          garment_image: processedGarmentImage,
          output_format: "jpeg",
          return_base64: false
        }
      };

      console.log('[FASHION_AI] 📤 Creating Fashion AI try-on request:', {
        model: requestBody.model_name,
        modelImageType: processedModelImage.startsWith('data:') ? 'base64' : 'url',
        garmentImageType: processedGarmentImage.startsWith('data:') ? 'base64' : 'url'
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fashion AI API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Fashion AI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log('[FASHION_AI] ✅ Fashion AI create response:', result);
      
      if (!result.id) {
        throw new Error('No request ID received from Fashion AI API');
      }

      return { requestId: result.id };
    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Fashion AI create try-on error:', error);
      throw error;
    }
  }

  static async checkStatus(requestId: string): Promise<FashionAIResponse> {
    try {
      if (!this.API_KEY) {
        console.error('[FASHION_AI] ❌ API key not configured:', {
          hasApiKey: !!this.API_KEY,
          envVar: process.env.FASHION_AI_API_KEY ? 'PRESENT' : 'MISSING'
        });
        throw new Error('Fashion AI API key not configured');
      }

      console.log('Checking Fashion AI status for request:', requestId);
      
      const response = await fetch(`https://api.fashn.ai/v1/status/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      console.log('Fashion AI status response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fashion AI status error details:', {
          requestId,
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        if (response.status === 404) {
          throw new Error(`Fashion AI request not found (404). Request ID: ${requestId} may be invalid or expired.`);
        }
        
        throw new Error(`Fashion AI status check error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Fashion AI status result:', result);
      
      const fashionResult = result as any;
      return {
        id: fashionResult.id,
        status: fashionResult.status,
        output_url: fashionResult.output?.[0] || fashionResult.output?.image_url || fashionResult.output_url,
        error: fashionResult.error?.message || fashionResult.error
      };
    } catch (error: any) {
      console.error('Fashion AI status check error:', error);
      throw error;
    }
  }

  static async processTryOnRequest(
    userId: string,
    tryOnId: string,
    modelImageUrl: string,
    garmentImageUrl: string
  ): Promise<void> {
    try {
      // Update status to processing
      await tryOnService.updateProcessingStatus(tryOnId, 'processing');

      // Create Fashion AI request
      const { requestId } = await this.createTryOn(modelImageUrl, garmentImageUrl);

      // Update status to processing
      await tryOnService.updateProcessingStatus(tryOnId, 'processing');

      // Start polling for completion (in background)
      this.startStatusPolling(tryOnId, requestId);

    } catch (error: any) {
      console.error('Process try-on request error:', error);
      
      // Update status to failed
      await tryOnService.updateProcessingStatus(tryOnId, 'failed');
      
      throw error;
    }
  }

  private static async startStatusPolling(tryOnId: string, requestId: string): Promise<void> {
    const maxAttempts = 60; // 5 minutes (5 second intervals)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        // Add a small delay for the first attempt to allow request to be registered
        if (attempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on first attempt
        }
        
        const status = await this.checkStatus(requestId);
        
        // Reset consecutive errors on successful status check
        consecutiveErrors = 0;
        
        if (status.status === 'completed' && status.output_url) {
          // Success - update with result
          console.log(`Try-on ${tryOnId} completed successfully after ${attempts} attempts`);
          await tryOnService.updateProcessingStatus(
            tryOnId, 
            'completed', 
            status.output_url
          );
          return;
        }
        
        if (status.status === 'failed' || status.error) {
          // Failed
          console.log(`Try-on ${tryOnId} failed by API after ${attempts} attempts`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          console.error(`Try-on ${tryOnId} timed out after ${maxAttempts} attempts`);
          return;
        }
        
        if (status.status === 'pending' || status.status === 'processing') {
          // Still processing, continue polling
          console.log(`Try-on ${tryOnId} still ${status.status} - attempt ${attempts}/${maxAttempts}`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
        
      } catch (error: any) {
        console.error('Status polling error:', error);
        consecutiveErrors++;
        attempts++;
        
        // If request is 404 (not found) and it's not the first few attempts, stop polling
        if ((error.message?.includes('404') || error.message?.includes('not found')) && attempts > 3) {
          console.error(`Try-on ${tryOnId} request not found (404) after ${attempts} attempts - stopping polling`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        // For 404 errors in the first few attempts, continue polling (request might not be ready yet)
        if (error.message?.includes('404') && attempts <= 3) {
          console.log(`Try-on ${tryOnId} request not found (404) - attempt ${attempts}/3, continuing polling...`);
        }
        
        // If too many consecutive errors or max attempts reached
        if (consecutiveErrors >= 5 || attempts >= maxAttempts) {
          console.error(`Try-on ${tryOnId} failed after ${attempts} attempts (${consecutiveErrors} consecutive errors)`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        // Continue polling with exponential backoff for errors
        const backoffDelay = Math.min(5000 * Math.pow(1.5, consecutiveErrors - 1), 30000);
        console.log(`Retrying in ${backoffDelay}ms (attempt ${attempts}/${maxAttempts}, error ${consecutiveErrors})`);
        setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately (first attempt will have its own delay)
    setTimeout(poll, 1000);
  }

  static async createModelFromDescription(description: string): Promise<{ requestId: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Fashion AI API key not configured');
      }

      console.log('[FASHION_AI] 🎨 Creating garment image from description:', {
        description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
        descriptionLength: description.length
      });

      const requestBody: ModelCreateRequest = {
        model_name: "model-create",
        inputs: {
          prompt: `Full body shot, fashion model wearing ${description}`,
          output_format: "jpeg",
          return_base64: false
        }
      };

      console.log('[FASHION_AI] 📤 Creating Fashion AI model from prompt:', {
        model: requestBody.model_name,
        prompt: requestBody.inputs.prompt
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fashion AI Model Create error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Fashion AI Model Create error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log('[FASHION_AI] ✅ Fashion AI Model Create response:', result);
      
      if (!result.id) {
        throw new Error('No request ID received from Fashion AI Model Create API');
      }

      return { requestId: result.id };
    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Fashion AI Model Create error:', error);
      throw error;
    }
  }

  static async processTextToImageTryOn(
    userId: string,
    tryOnId: string,
    modelImageUrl: string,
    dressDescription: string
  ): Promise<void> {
    try {
      console.log('[FASHION_AI] 🔄 Starting text-to-image try-on workflow:', {
        userId,
        tryOnId,
        modelImageUrl: modelImageUrl.substring(0, 50) + '...',
        dressDescription: dressDescription.substring(0, 100) + '...'
      });

      // Update status to processing
      await tryOnService.updateProcessingStatus(tryOnId, 'processing');

      // Step 1: Create garment image from description
      const { requestId: modelCreateRequestId } = await this.createModelFromDescription(dressDescription);
      
      console.log('[FASHION_AI] 🎨 Model Create request started:', { modelCreateRequestId });

      // Start polling for Model Create completion, then proceed to try-on
      this.startTextToImagePolling(tryOnId, modelCreateRequestId, modelImageUrl);

    } catch (error: any) {
      console.error('Process text-to-image try-on error:', error);
      
      // Update status to failed
      await tryOnService.updateProcessingStatus(tryOnId, 'failed');
      
      throw error;
    }
  }

  private static async startTextToImagePolling(
    tryOnId: string, 
    modelCreateRequestId: string, 
    modelImageUrl: string
  ): Promise<void> {
    const maxAttempts = 180; // 15 minutes (model-create takes longer)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        // Add delay for first attempt to allow request to be processed
        if (attempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on first attempt
        }
        
        const status = await this.checkStatus(modelCreateRequestId);
        
        // Reset consecutive errors on successful status check
        consecutiveErrors = 0;
        
        if (status.status === 'completed' && status.output_url) {
          // Model Create completed - now start try-on with generated garment
          console.log(`[FASHION_AI] ✅ Model Create ${modelCreateRequestId} completed, starting try-on with generated garment`);
          
          try {
            // Start the actual try-on process with generated garment image
            const { requestId: tryOnRequestId } = await this.createTryOn(modelImageUrl, status.output_url);
            
            console.log('[FASHION_AI] 🔄 Try-on request started with generated garment:', { tryOnRequestId });
            
            // Start polling for try-on completion
            this.startStatusPolling(tryOnId, tryOnRequestId);
          } catch (tryOnError) {
            console.error(`[FASHION_AI] ❌ Failed to start try-on with generated garment:`, tryOnError);
            await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          }
          
          return;
        }
        
        if (status.status === 'failed' || status.error) {
          // Model Create failed
          console.log(`[FASHION_AI] ❌ Model Create ${modelCreateRequestId} failed after ${attempts} attempts`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          console.error(`[FASHION_AI] ⏰ Model Create ${modelCreateRequestId} timed out after ${maxAttempts} attempts`);
          return;
        }
        
        if (status.status === 'pending' || status.status === 'processing') {
          // Still processing, continue polling
          console.log(`[FASHION_AI] 🔄 Model Create ${modelCreateRequestId} still ${status.status} - attempt ${attempts}/${maxAttempts}`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
        
      } catch (error: any) {
        console.error('Model Create polling error:', error);
        consecutiveErrors++;
        attempts++;
        
        // Handle 404 errors
        if ((error.message?.includes('404') || error.message?.includes('not found')) && attempts > 3) {
          console.error(`[FASHION_AI] ❌ Model Create ${modelCreateRequestId} not found (404) after ${attempts} attempts - stopping polling`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        if (error.message?.includes('404') && attempts <= 3) {
          console.log(`[FASHION_AI] 🔄 Model Create ${modelCreateRequestId} not found (404) - attempt ${attempts}/3, continuing...`);
        }
        
        // If too many consecutive errors or max attempts reached
        if (consecutiveErrors >= 5 || attempts >= maxAttempts) {
          console.error(`[FASHION_AI] ❌ Model Create ${modelCreateRequestId} failed after ${attempts} attempts (${consecutiveErrors} consecutive errors)`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        // Continue polling with backoff
        const backoffDelay = Math.min(5000 * Math.pow(1.5, consecutiveErrors - 1), 30000);
        console.log(`[FASHION_AI] 🔄 Retrying Model Create in ${backoffDelay}ms (attempt ${attempts}/${maxAttempts})`);
        setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately
    setTimeout(poll, 1000);
  }

  static async createProductToModel(
    productImageUrl: string,
    modelImageUrl?: string,
    prompt?: string
  ): Promise<{ requestId: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Fashion AI API key not configured');
      }

      console.log('[FASHION_AI] 🎨 Creating product-to-model:', {
        productImageUrl: productImageUrl.substring(0, 50) + '...',
        hasModelImage: !!modelImageUrl,
        hasPrompt: !!prompt
      });

      // Prepare images for API
      const processedProductImage = await ImageUtils.prepareImageForAPI(productImageUrl);
      let processedModelImage = undefined;
      if (modelImageUrl) {
        processedModelImage = await ImageUtils.prepareImageForAPI(modelImageUrl);
      }

      const requestBody: ProductToModelRequest = {
        model_name: "product-to-model",
        inputs: {
          product_image: processedProductImage,
          output_format: "jpeg",
          return_base64: false
        }
      };

      // Add optional parameters
      if (processedModelImage) {
        requestBody.inputs.model_image = processedModelImage;
      }
      if (prompt) {
        requestBody.inputs.prompt = prompt;
      }

      console.log('[FASHION_AI] 📤 Creating Fashion AI product-to-model request:', {
        model: requestBody.model_name,
        hasModelImage: !!requestBody.inputs.model_image,
        hasPrompt: !!requestBody.inputs.prompt
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fashion AI Product-to-Model error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Fashion AI Product-to-Model error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log('[FASHION_AI] ✅ Fashion AI Product-to-Model response:', result);
      
      if (!result.id) {
        throw new Error('No request ID received from Fashion AI Product-to-Model API');
      }

      return { requestId: result.id };
    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Fashion AI Product-to-Model error:', error);
      throw error;
    }
  }

  static async processCustomModelCreation(
    userId: string,
    modelId: string,
    prompt: string,
    modelType: 'model-create' | 'product-to-model',
    productImageUrl?: string
  ): Promise<void> {
    try {
      console.log('[FASHION_AI] 🎨 Starting custom model creation workflow:', {
        userId: userId.substring(0, 8) + '...',
        modelId: modelId.substring(0, 8) + '...',
        modelType,
        promptLength: prompt.length
      });

      let requestId: string;

      if (modelType === 'model-create') {
        // Create model from prompt
        const result = await this.createModelFromDescription(prompt);
        requestId = result.requestId;
      } else if (modelType === 'product-to-model' && productImageUrl) {
        // Create model from product image
        const result = await this.createProductToModel(productImageUrl, undefined, prompt);
        requestId = result.requestId;
      } else {
        throw new Error('Invalid model type or missing product image for product-to-model');
      }

      // Update model status and Fashion AI request ID
      const { supabase } = await import('./supabase.js');
      const { error } = await supabase
        .from('user_models')
        .update({ 
          status: 'processing',
          fashion_ai_request_id: requestId 
        })
        .eq('id', modelId);

      if (error) {
        console.error('[FASHION_AI] ❌ Error saving Fashion AI request ID:', error);
      }

      console.log('[FASHION_AI] 🔄 Custom model creation request started:', { requestId });

      // Start polling for completion
      this.startCustomModelPolling(modelId, requestId);

    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Process custom model creation error:', error);
      
      // Update status to failed
      await userModelService.updateModelStatus(modelId, 'failed');
      
      throw error;
    }
  }

  private static async startCustomModelPolling(modelId: string, requestId: string): Promise<void> {
    const maxAttempts = 180; // 15 minutes
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        // Add delay for first attempt
        if (attempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on first attempt
        }
        
        const status = await this.checkStatus(requestId);
        
        // Reset consecutive errors on successful status check
        consecutiveErrors = 0;
        
        if (status.status === 'completed' && status.output_url) {
          // Success - update model with result
          console.log(`[FASHION_AI] ✅ Custom model ${modelId} completed after ${attempts} attempts`);
          await userModelService.updateModelStatus(modelId, 'completed', status.output_url);
          return;
        }
        
        if (status.status === 'failed' || status.error) {
          // Failed
          console.log(`[FASHION_AI] ❌ Custom model ${modelId} failed by API after ${attempts} attempts`);
          await userModelService.updateModelStatus(modelId, 'failed');
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout
          await userModelService.updateModelStatus(modelId, 'failed');
          console.error(`[FASHION_AI] ⏰ Custom model ${modelId} timed out after ${maxAttempts} attempts`);
          return;
        }
        
        if (status.status === 'pending' || status.status === 'processing') {
          // Still processing, continue polling
          console.log(`[FASHION_AI] 🔄 Custom model ${modelId} still ${status.status} - attempt ${attempts}/${maxAttempts}`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
        
      } catch (error: any) {
        console.error('[FASHION_AI] ❌ Custom model polling error:', error);
        consecutiveErrors++;
        attempts++;
        
        // Handle 404 errors
        if ((error.message?.includes('404') || error.message?.includes('not found')) && attempts > 3) {
          console.error(`[FASHION_AI] ❌ Custom model ${modelId} not found (404) after ${attempts} attempts - stopping polling`);
          await userModelService.updateModelStatus(modelId, 'failed');
          return;
        }
        
        if (error.message?.includes('404') && attempts <= 3) {
          console.log(`[FASHION_AI] 🔄 Custom model ${modelId} not found (404) - attempt ${attempts}/3, continuing...`);
        }
        
        // If too many consecutive errors or max attempts reached
        if (consecutiveErrors >= 5 || attempts >= maxAttempts) {
          console.error(`[FASHION_AI] ❌ Custom model ${modelId} failed after ${attempts} attempts (${consecutiveErrors} consecutive errors)`);
          await userModelService.updateModelStatus(modelId, 'failed');
          return;
        }
        
        // Continue polling with backoff
        const backoffDelay = Math.min(5000 * Math.pow(1.5, consecutiveErrors - 1), 30000);
        console.log(`[FASHION_AI] 🔄 Retrying custom model in ${backoffDelay}ms (attempt ${attempts}/${maxAttempts})`);
        setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately
    setTimeout(poll, 1000);
  }

  static async createFaceToModel(faceImageUrl: string): Promise<{ requestId: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Fashion AI API key not configured');
      }

      console.log('[FASHION_AI] 👤 Creating face-to-model avatar:', {
        faceImageUrl: faceImageUrl.substring(0, 50) + '...',
        isLocalFile: ImageUtils.isLocalFilePath(faceImageUrl)
      });

      // Prepare face image for API
      const processedFaceImage = await ImageUtils.prepareImageForAPI(faceImageUrl);

      const requestBody: FaceToModelRequest = {
        model_name: "face-to-model",
        inputs: {
          face_image: processedFaceImage,
          output_format: "jpeg",
          return_base64: false
        }
      };

      console.log('[FASHION_AI] 📤 Creating Fashion AI face-to-model request:', {
        model: requestBody.model_name,
        faceImageType: processedFaceImage.startsWith('data:') ? 'base64' : 'url'
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fashion AI Face-to-Model error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Fashion AI Face-to-Model error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log('[FASHION_AI] ✅ Fashion AI Face-to-Model response:', result);
      
      if (!result.id) {
        throw new Error('No request ID received from Fashion AI Face-to-Model API');
      }

      return { requestId: result.id };
    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Fashion AI Face-to-Model error:', error);
      throw error;
    }
  }

  static async processAvatarCreation(
    userId: string,
    avatarId: string,
    faceImageUrl: string
  ): Promise<void> {
    try {
      console.log('[FASHION_AI] 👤 Starting avatar creation workflow:', {
        userId: userId.substring(0, 8) + '...',
        avatarId: avatarId.substring(0, 8) + '...',
        faceImageUrl: faceImageUrl.substring(0, 50) + '...'
      });

      // Create face-to-model avatar
      const { requestId } = await this.createFaceToModel(faceImageUrl);

      console.log('[FASHION_AI] 🔄 Avatar creation request started:', { requestId });

      // Update avatar status and Fashion AI request ID
      const { supabase } = await import('./supabase.js');
      const { error } = await supabase
        .from('user_avatars')
        .update({ 
          status: 'processing',
          fashion_ai_request_id: requestId 
        })
        .eq('id', avatarId);

      if (error) {
        console.error('[FASHION_AI] ❌ Error saving Fashion AI request ID to avatar:', error);
      }

      // Start polling for completion
      this.startAvatarPolling(avatarId, requestId);

    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Process avatar creation error:', error);
      
      // Update avatar status to failed
      const { supabase } = await import('./supabase.js');
      await supabase
        .from('user_avatars')
        .update({ status: 'failed' })
        .eq('id', avatarId);
      
      throw error;
    }
  }

  private static async startAvatarPolling(avatarId: string, requestId: string): Promise<void> {
    const maxAttempts = 120; // 10 minutes (face-to-model is faster than model-create)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        // Add delay for first attempt
        if (attempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on first attempt
        }
        
        const status = await this.checkStatus(requestId);
        
        // Reset consecutive errors on successful status check
        consecutiveErrors = 0;
        
        if (status.status === 'completed' && status.output_url) {
          // Success - update avatar with result
          console.log(`[FASHION_AI] ✅ Avatar ${avatarId} completed after ${attempts} attempts`);
          
          const { supabase } = await import('./supabase.js');
          await supabase
            .from('user_avatars')
            .update({ 
              status: 'completed',
              avatar_image_url: status.output_url
            })
            .eq('id', avatarId);
          
          return;
        }
        
        if (status.status === 'failed' || status.error) {
          // Failed
          console.log(`[FASHION_AI] ❌ Avatar ${avatarId} failed by API after ${attempts} attempts`);
          
          const { supabase } = await import('./supabase.js');
          await supabase
            .from('user_avatars')
            .update({ status: 'failed' })
            .eq('id', avatarId);
          
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout
          console.error(`[FASHION_AI] ⏰ Avatar ${avatarId} timed out after ${maxAttempts} attempts`);
          
          const { supabase } = await import('./supabase.js');
          await supabase
            .from('user_avatars')
            .update({ status: 'failed' })
            .eq('id', avatarId);
          
          return;
        }
        
        if (status.status === 'pending' || status.status === 'processing') {
          // Still processing, continue polling
          console.log(`[FASHION_AI] 🔄 Avatar ${avatarId} still ${status.status} - attempt ${attempts}/${maxAttempts}`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
        
      } catch (error: any) {
        console.error('[FASHION_AI] ❌ Avatar polling error:', error);
        consecutiveErrors++;
        attempts++;
        
        // Handle 404 errors
        if ((error.message?.includes('404') || error.message?.includes('not found')) && attempts > 3) {
          console.error(`[FASHION_AI] ❌ Avatar ${avatarId} not found (404) after ${attempts} attempts - stopping polling`);
          
          const { supabase } = await import('./supabase.js');
          await supabase
            .from('user_avatars')
            .update({ status: 'failed' })
            .eq('id', avatarId);
          
          return;
        }
        
        if (error.message?.includes('404') && attempts <= 3) {
          console.log(`[FASHION_AI] 🔄 Avatar ${avatarId} not found (404) - attempt ${attempts}/3, continuing...`);
        }
        
        // If too many consecutive errors or max attempts reached
        if (consecutiveErrors >= 5 || attempts >= maxAttempts) {
          console.error(`[FASHION_AI] ❌ Avatar ${avatarId} failed after ${attempts} attempts (${consecutiveErrors} consecutive errors)`);
          
          const { supabase } = await import('./supabase.js');
          await supabase
            .from('user_avatars')
            .update({ status: 'failed' })
            .eq('id', avatarId);
          
          return;
        }
        
        // Continue polling with backoff
        const backoffDelay = Math.min(5000 * Math.pow(1.5, consecutiveErrors - 1), 30000);
        console.log(`[FASHION_AI] 🔄 Retrying avatar in ${backoffDelay}ms (attempt ${attempts}/${maxAttempts})`);
        setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately
    setTimeout(poll, 1000);
  }

  static async processProductToModelTryOn(
    userId: string,
    tryOnId: string,
    productImageUrl: string,
    scenePrompt?: string
  ): Promise<void> {
    try {
      console.log('[FASHION_AI] 🛍️ Starting product-to-model try-on workflow:', {
        userId: userId.substring(0, 8) + '...',
        tryOnId: tryOnId.substring(0, 8) + '...',
        productImageUrl: productImageUrl.substring(0, 50) + '...',
        hasScenePrompt: !!scenePrompt
      });

      // Update status to processing
      await tryOnService.updateProcessingStatus(tryOnId, 'processing');

      // Create product-to-model request
      const { requestId } = await this.createProductToModel(
        productImageUrl,
        undefined, // No model image for product-to-model
        scenePrompt
      );

      console.log('[FASHION_AI] 🔄 Product-to-model request started:', { requestId });

      // Start polling for completion
      this.startProductToModelPolling(tryOnId, requestId);

    } catch (error: any) {
      console.error('[FASHION_AI] ❌ Process product-to-model try-on error:', error);
      
      // Update status to failed
      await tryOnService.updateProcessingStatus(tryOnId, 'failed');
      
      throw error;
    }
  }

  private static async startProductToModelPolling(tryOnId: string, requestId: string): Promise<void> {
    const maxAttempts = 120; // 10 minutes (product-to-model is typically faster)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        // Add delay for first attempt
        if (attempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on first attempt
        }
        
        const status = await this.checkStatus(requestId);
        
        // Reset consecutive errors on successful status check
        consecutiveErrors = 0;
        
        if (status.status === 'completed' && status.output_url) {
          // Success - update try-on with result
          console.log(`[FASHION_AI] ✅ Product-to-model ${tryOnId} completed after ${attempts} attempts`);
          await tryOnService.updateProcessingStatus(
            tryOnId, 
            'completed', 
            status.output_url
          );
          return;
        }
        
        if (status.status === 'failed' || status.error) {
          // Failed
          console.log(`[FASHION_AI] ❌ Product-to-model ${tryOnId} failed by API after ${attempts} attempts`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          console.error(`[FASHION_AI] ⏰ Product-to-model ${tryOnId} timed out after ${maxAttempts} attempts`);
          return;
        }
        
        if (status.status === 'pending' || status.status === 'processing') {
          // Still processing, continue polling
          console.log(`[FASHION_AI] 🔄 Product-to-model ${tryOnId} still ${status.status} - attempt ${attempts}/${maxAttempts}`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
        
      } catch (error: any) {
        console.error('[FASHION_AI] ❌ Product-to-model polling error:', error);
        consecutiveErrors++;
        attempts++;
        
        // Handle 404 errors
        if ((error.message?.includes('404') || error.message?.includes('not found')) && attempts > 3) {
          console.error(`[FASHION_AI] ❌ Product-to-model ${tryOnId} not found (404) after ${attempts} attempts - stopping polling`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        if (error.message?.includes('404') && attempts <= 3) {
          console.log(`[FASHION_AI] 🔄 Product-to-model ${tryOnId} not found (404) - attempt ${attempts}/3, continuing...`);
        }
        
        // If too many consecutive errors or max attempts reached
        if (consecutiveErrors >= 5 || attempts >= maxAttempts) {
          console.error(`[FASHION_AI] ❌ Product-to-model ${tryOnId} failed after ${attempts} attempts (${consecutiveErrors} consecutive errors)`);
          await tryOnService.updateProcessingStatus(tryOnId, 'failed');
          return;
        }
        
        // Continue polling with backoff
        const backoffDelay = Math.min(5000 * Math.pow(1.5, consecutiveErrors - 1), 30000);
        console.log(`[FASHION_AI] 🔄 Retrying product-to-model in ${backoffDelay}ms (attempt ${attempts}/${maxAttempts})`);
        setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately
    setTimeout(poll, 1000);
  }

  static async getCreditsBalance(): Promise<{ total: number; subscription: number; on_demand: number }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Fashion AI API key not configured');
      }

      const response = await fetch('https://api.fashn.ai/v1/credits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fashion AI credits check error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      
      return {
        total: result.credits?.total || 0,
        subscription: result.credits?.subscription || 0,
        on_demand: result.credits?.on_demand || 0
      };
    } catch (error: any) {
      console.error('Fashion AI credits check error:', error);
      throw error;
    }
  }
}