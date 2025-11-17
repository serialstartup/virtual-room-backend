import { UserModel, CreateUserModelRequest, UpdateUserModelRequest } from '../types/index.js';
export declare const userModelService: {
    createUserModel(userId: string, data: CreateUserModelRequest): Promise<UserModel>;
    getUserModels(userId: string): Promise<UserModel[]>;
    getUserModelById(userId: string, modelId: string): Promise<UserModel>;
    updateUserModel(userId: string, modelId: string, updates: UpdateUserModelRequest): Promise<UserModel>;
    deleteUserModel(userId: string, modelId: string): Promise<void>;
    updateModelStatus(modelId: string, status: "processing" | "completed" | "failed", imageUrl?: string): Promise<void>;
    findModelByFashionAIRequestId(requestId: string): Promise<UserModel | null>;
};
