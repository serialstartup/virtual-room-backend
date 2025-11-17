import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class AvatarController {
    static createAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAvatars(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAvatarById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAvatarStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static retryAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getPrimaryAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    static setPrimaryAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
}
