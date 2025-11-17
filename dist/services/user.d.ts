import type { User, UpdateUserRequest, UserSettings, UpdateUserSettingsRequest } from "../types/auth.js";
export declare class UserService {
    static getUserById(userId: string): Promise<User | null>;
    static updateUser(userId: string, userData: UpdateUserRequest): Promise<User>;
    static deleteUser(userId: string): Promise<void>;
    static getAllUsers(): Promise<User[]>;
    static getUserSettings(userId: string): Promise<UserSettings | null>;
    static createDefaultSettingsForUser(userId: string): Promise<void>;
    static updateUserSettings(userId: string, settings: UpdateUserSettingsRequest): Promise<UserSettings>;
    static getNotificationSettings(userId: string): Promise<{
        push_notifications: boolean;
        email_notifications: boolean;
        new_features: boolean;
    } | null>;
}
