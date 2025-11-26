import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class FeedbackController {
    static getFeedback(req: AuthenticatedRequest, res: Response): Promise<void>;
    static setFeedback(req: AuthenticatedRequest, res: Response): Promise<void>;
    static removeFeedback(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUserFeedbackStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUserFeedback(req: AuthenticatedRequest, res: Response): Promise<void>;
}
