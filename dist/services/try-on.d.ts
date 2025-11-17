import { TryOn, TryOnWithWardrobe, CreateTryOnRequest } from '../types/index.js';
export declare const tryOnService: {
    createTryOn(userId: string, tryOnData: CreateTryOnRequest): Promise<TryOn>;
    getTryOns(userId: string): Promise<TryOnWithWardrobe[]>;
    getTryOn(userId: string, tryOnId: string): Promise<TryOnWithWardrobe>;
    updateTryOn(userId: string, tryOnId: string, updates: Partial<TryOn>): Promise<TryOn>;
    deleteTryOn(userId: string, tryOnId: string): Promise<void>;
    getProcessingStatus(userId: string, tryOnId: string): Promise<string>;
    updateProcessingStatus(tryOnId: string, status: "pending" | "processing" | "completed" | "failed", resultImageUrl?: string): Promise<TryOn>;
};
