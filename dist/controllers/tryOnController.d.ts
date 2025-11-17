import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class TryOnController {
    static getTryOns(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTryOnById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createTryOn(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteTryOn(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getProcessingStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static classicTryOn(req: AuthenticatedRequest, res: Response): Promise<void>;
    static productToModel(req: AuthenticatedRequest, res: Response): Promise<void>;
    static textToFashion(req: AuthenticatedRequest, res: Response): Promise<void>;
    static avatarTryOn(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getCredits(req: AuthenticatedRequest, res: Response): Promise<void>;
}
