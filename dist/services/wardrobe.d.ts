import { Wardrobe, UpdateWardrobeRequest, UserFavorites, UserStats } from '../types/index.js';
export declare const wardrobeService: {
    addToWardrobe(userId: string, tryOnId: string, liked?: boolean | null): Promise<Wardrobe>;
    updateWardrobeItem(userId: string, tryOnId: string, updates: UpdateWardrobeRequest): Promise<Wardrobe>;
    removeFromWardrobe(userId: string, tryOnId: string): Promise<void>;
    getWardrobe(userId: string, filter?: "all" | "liked" | "disliked"): Promise<Wardrobe[]>;
    getFavorites(userId: string): Promise<UserFavorites[]>;
    getDisliked(userId: string): Promise<Wardrobe[]>;
    getUndecided(userId: string): Promise<Wardrobe[]>;
    getUserStats(userId: string): Promise<UserStats>;
    toggleLike(userId: string, tryOnId: string): Promise<Wardrobe>;
    toggleDislike(userId: string, tryOnId: string): Promise<Wardrobe>;
};
