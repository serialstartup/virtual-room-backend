import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class UserController {
    static updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUser(req: Request, res: Response): Promise<void>;
    static getAllUsers(_req: Request, res: Response): Promise<void>;
    static getUserSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateUserSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
}
