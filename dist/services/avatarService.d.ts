import { UserAvatar, CreateUserAvatarRequest, UpdateUserAvatarRequest } from '../types/index.js';
export declare const avatarService: {
    createAvatar(userId: string, data: CreateUserAvatarRequest): Promise<UserAvatar>;
    getUserAvatars(userId: string): Promise<UserAvatar[]>;
    getAvatarById(userId: string, avatarId: string): Promise<UserAvatar>;
    updateAvatar(userId: string, avatarId: string, updates: UpdateUserAvatarRequest): Promise<UserAvatar>;
    deleteAvatar(userId: string, avatarId: string): Promise<void>;
    updateAvatarStatus(avatarId: string, status: "processing" | "completed" | "failed", avatarImageUrl?: string): Promise<void>;
    getPrimaryAvatar(userId: string): Promise<UserAvatar | null>;
    setPrimaryAvatar(userId: string, avatarId: string): Promise<UserAvatar>;
    findAvatarByFashionAIRequestId(requestId: string): Promise<UserAvatar | null>;
};
