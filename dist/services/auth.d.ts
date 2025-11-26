import type { User, SignupRequest, LoginRequest, UpdateUserRequest, JWTPayload } from "../types/auth.js";
export declare class AuthService {
    private static saltRounds;
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    static generateJWT(payload: JWTPayload): string;
    static verifyJWT(token: string): JWTPayload;
    static checkEmailExists(email: string): Promise<boolean>;
    static signup(userData: SignupRequest, acceptLanguage?: string): Promise<User>;
    private static createDefaultUserSettings;
    private static createDefaultUserStats;
    static login(credentials: LoginRequest): Promise<User>;
    static getUserById(userId: string): Promise<User | null>;
    static updateUser(userId: string, userData: UpdateUserRequest): Promise<User>;
    static deleteUser(userId: string): Promise<void>;
    static createDefaultUserSettingsForExistingUser(userId: string): Promise<void>;
}
