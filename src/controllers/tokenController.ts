import type { Request, Response } from "express";
import { TokenService } from "../services/tokenService.js";
import { APIResponse } from "../types/index.js";
import type { AuthenticatedRequest, TokenBalance, TokenTransaction } from "../types/auth.js";

export class TokenController {
  /**
   * Get user's token balance and statistics
   */
  static async getTokenBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const balance = await TokenService.getTokenBalance(userId);

      const response: APIResponse<TokenBalance> = {
        success: true,
        data: balance,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get token balance error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get token balance",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get user's token transaction history
   */
  static async getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const transactions = await TokenService.getTransactionHistory(userId, limit);

      const response: APIResponse<TokenTransaction[]> = {
        success: true,
        data: transactions,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get transaction history error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get transaction history",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Purchase tokens (placeholder for future implementation)
   */
  static async purchaseTokens(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { package_type, amount } = req.body;

      if (!package_type || !amount) {
        res.status(400).json({
          success: false,
          error: "package_type and amount are required",
        });
        return;
      }

      // For now, just add tokens as a purchase (this would integrate with payment gateway)
      const transaction = await TokenService.creditTokens(
        userId,
        amount,
        `Token package purchase: ${package_type}`,
        'purchase'
      );

      console.log(`[TOKEN_CONTROLLER] 💳 Token purchase:`, {
        userId: userId.substring(0, 8) + '...',
        packageType: package_type,
        amount,
        transactionId: transaction.id
      });

      const response: APIResponse<TokenTransaction> = {
        success: true,
        data: transaction,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Purchase tokens error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to purchase tokens",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get token packages and pricing (placeholder for future implementation)
   */
  static async getTokenPackages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // For now, return predefined packages
      const packages = [
        {
          id: 'starter',
          name: 'Starter Pack',
          tokens: 10,
          price: 9.99,
          currency: 'USD',
          popular: false
        },
        {
          id: 'premium',
          name: 'Premium Pack',
          tokens: 25,
          price: 19.99,
          currency: 'USD',
          popular: true,
          savings: '20%'
        },
        {
          id: 'pro',
          name: 'Pro Pack',
          tokens: 50,
          price: 34.99,
          currency: 'USD',
          popular: false,
          savings: '30%'
        }
      ];

      const response: APIResponse<typeof packages> = {
        success: true,
        data: packages,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get token packages error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get token packages",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get token costs for different operations
   */
  static async getTokenCosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const costs = {
        CLASSIC_TRY_ON: TokenService.getTokenCost('CLASSIC_TRY_ON'),
        PRODUCT_TO_MODEL: TokenService.getTokenCost('PRODUCT_TO_MODEL'),
        TEXT_TO_FASHION: TokenService.getTokenCost('TEXT_TO_FASHION'),
        AVATAR_TRY_ON: TokenService.getTokenCost('AVATAR_TRY_ON'),
        AVATAR_CREATION: TokenService.getTokenCost('AVATAR_CREATION'),
        CUSTOM_MODEL: TokenService.getTokenCost('CUSTOM_MODEL')
      };

      const response: APIResponse<typeof costs> = {
        success: true,
        data: costs,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get token costs error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to get token costs",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Admin only: Credit tokens to a user (for testing/support)
   */
  static async adminCreditTokens(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { target_user_id, amount, description } = req.body;

      if (!target_user_id || !amount) {
        res.status(400).json({
          success: false,
          error: "target_user_id and amount are required",
        });
        return;
      }

      // Add tokens as admin credit
      const transaction = await TokenService.creditTokens(
        target_user_id,
        amount,
        description || 'Admin credit',
        'credit'
      );

      console.log(`[TOKEN_CONTROLLER] 👑 Admin token credit:`, {
        adminId: req.user!.userId.substring(0, 8) + '...',
        targetUserId: target_user_id.substring(0, 8) + '...',
        amount,
        transactionId: transaction.id
      });

      const response: APIResponse<TokenTransaction> = {
        success: true,
        data: transaction,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Admin credit tokens error:", error);

      const response: APIResponse<never> = {
        success: false,
        error: error.message || "Failed to credit tokens",
      };

      res.status(500).json(response);
    }
  }
}