import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class PurchaseController {
    /**
     * Verify purchase with RevenueCat and credit tokens
     */
    static verifyPurchase(req: AuthenticatedRequest, res: Response): Promise<void>;
}
