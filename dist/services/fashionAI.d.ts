interface FashionAIResponse {
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    output_url?: string;
    error?: string;
}
export declare class FashionAIService {
    private static readonly API_URL;
    private static readonly API_KEY;
    static createTryOn(modelImageUrl: string, garmentImageUrl: string): Promise<{
        requestId: string;
    }>;
    static checkStatus(requestId: string): Promise<FashionAIResponse>;
    static processTryOnRequest(userId: string, tryOnId: string, modelImageUrl: string, garmentImageUrl: string): Promise<void>;
    private static startStatusPolling;
    static createModelFromDescription(description: string): Promise<{
        requestId: string;
    }>;
    static processTextToImageTryOn(userId: string, tryOnId: string, modelImageUrl: string, dressDescription: string): Promise<void>;
    private static startTextToImagePolling;
    static createProductToModel(productImageUrl: string, modelImageUrl?: string, prompt?: string): Promise<{
        requestId: string;
    }>;
    static processCustomModelCreation(userId: string, modelId: string, prompt: string, modelType: "model-create" | "product-to-model", productImageUrl?: string): Promise<void>;
    private static startCustomModelPolling;
    static createFaceToModel(faceImageUrl: string): Promise<{
        requestId: string;
    }>;
    static processAvatarCreation(userId: string, avatarId: string, faceImageUrl: string): Promise<void>;
    private static startAvatarPolling;
    static processProductToModelTryOn(userId: string, tryOnId: string, productImageUrl: string, scenePrompt?: string): Promise<void>;
    private static startProductToModelPolling;
    static getCreditsBalance(): Promise<{
        total: number;
        subscription: number;
        on_demand: number;
    }>;
}
export {};
