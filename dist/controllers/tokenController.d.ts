import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class TokenController {
    /**
     * Get user's token balance and statistics
     */
    static getTokenBalance(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get user's token transaction history
     */
    static getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Purchase tokens (placeholder for future implementation)
     */
    static purchaseTokens(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get token packages and pricing (placeholder for future implementation)
     */
    static getTokenPackages(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get token costs for different operations
     */
    static getTokenCosts(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Admin only: Credit tokens to a user (for testing/support)
     */
    static adminCreditTokens(req: AuthenticatedRequest, res: Response): Promise<void>;
}
