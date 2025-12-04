import type { TokenTransaction, TokenBalance, TokenUsageRequest } from "../types/auth.js";
export declare class TokenService {
    static readonly TOKEN_COSTS: {
        readonly CLASSIC_TRY_ON: 1;
        readonly PRODUCT_TO_MODEL: 1;
        readonly TEXT_TO_FASHION: 2;
        readonly AVATAR_TRY_ON: 1;
        readonly AVATAR_CREATION: 3;
        readonly CUSTOM_MODEL: 2;
    };
    static readonly FREE_TOKENS_ON_SIGNUP = 5;
    /**
     * Get user's current token balance and usage statistics
     */
    static getTokenBalance(userId: string): Promise<TokenBalance>;
    /**
     * Check if user has sufficient tokens for an operation
     */
    static hasSufficientTokens(userId: string, requiredAmount: number): Promise<boolean>;
    /**
     * Use tokens for an operation (debit)
     */
    static useTokens(userId: string, usage: TokenUsageRequest): Promise<TokenTransaction>;
    /**
     * Add tokens to user (credit)
     */
    static creditTokens(userId: string, amount: number, description: string, transactionType?: 'credit' | 'purchase' | 'gift' | 'refund'): Promise<TokenTransaction>;
    /**
     * Give free tokens to new users
     */
    static giveWelcomeTokens(userId: string): Promise<TokenTransaction>;
    /**
     * Get user's token transaction history
     */
    static getTransactionHistory(userId: string, limit?: number): Promise<TokenTransaction[]>;
    /**
     * Record a token transaction
     */
    private static recordTransaction;
    /**
     * Refund tokens (for failed operations)
     */
    static refundTokens(userId: string, amount: number, reason: string, originalTryOnId?: string): Promise<TokenTransaction>;
    /**
     * Get token cost for specific operation
     */
    static getTokenCost(operationType: keyof typeof TokenService.TOKEN_COSTS): number;
    /**
     * Validate and use tokens for a try-on operation
     */
    static validateAndUseTokensForTryOn(userId: string, operationType: keyof typeof TokenService.TOKEN_COSTS, tryOnId: string): Promise<{
        success: boolean;
        transaction?: TokenTransaction;
        error?: string;
    }>;
}
