import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
export declare class WardrobeController {
    static getAllWardrobe(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAllFavorites(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getWardrobeStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static toggleLike(req: AuthenticatedRequest, res: Response): Promise<void>;
    static toggleDislike(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteWardrobe(req: AuthenticatedRequest, res: Response): Promise<void>;
    static addToWardrobe(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateWardrobe(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
