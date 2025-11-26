import { supabase, handleSupabaseError } from "./supabase.js";
export class TokenService {
    // Standard token costs for different operations
    static TOKEN_COSTS = {
        CLASSIC_TRY_ON: 1,
        PRODUCT_TO_MODEL: 1,
        TEXT_TO_FASHION: 2,
        AVATAR_TRY_ON: 1,
        AVATAR_CREATION: 3,
        CUSTOM_MODEL: 2
    };
    // Free tokens given to new users
    static FREE_TOKENS_ON_SIGNUP = 3;
    /**
     * Get user's current token balance and usage statistics
     */
    static async getTokenBalance(userId) {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("token, total_tokens_used")
                .eq("id", userId)
                .eq("active", true)
                .single();
            if (error) {
                handleSupabaseError(error, "token balance sorgulama");
            }
            if (!data) {
                throw new Error("User not found");
            }
            // Calculate total purchased (current + used)
            const totalPurchased = data.token + data.total_tokens_used;
            return {
                current_balance: data.token,
                total_used: data.total_tokens_used,
                total_purchased: totalPurchased,
                has_sufficient_balance: data.token > 0
            };
        }
        catch (error) {
            console.error("Get token balance error:", error);
            throw error;
        }
    }
    /**
     * Check if user has sufficient tokens for an operation
     */
    static async hasSufficientTokens(userId, requiredAmount) {
        try {
            const balance = await this.getTokenBalance(userId);
            return balance.current_balance >= requiredAmount;
        }
        catch (error) {
            console.error("Check sufficient tokens error:", error);
            return false;
        }
    }
    /**
     * Use tokens for an operation (debit)
     */
    static async useTokens(userId, usage) {
        try {
            // Start transaction
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("token, total_tokens_used")
                .eq("id", userId)
                .eq("active", true)
                .single();
            if (userError || !userData) {
                throw new Error("User not found or inactive");
            }
            if (userData.token < usage.amount) {
                throw new Error("Insufficient token balance");
            }
            // Update user balance and total used
            const newBalance = userData.token - usage.amount;
            const newTotalUsed = userData.total_tokens_used + usage.amount;
            const { error: updateError } = await supabase
                .from("users")
                .update({
                token: newBalance,
                total_tokens_used: newTotalUsed
            })
                .eq("id", userId);
            if (updateError) {
                handleSupabaseError(updateError, "token kullanım güncellemesi");
            }
            // Record transaction
            const transaction = await this.recordTransaction(userId, {
                transaction_type: 'debit',
                amount: -usage.amount, // negative for debit
                description: usage.description,
                try_on_id: usage.try_on_id || null
            });
            console.log(`[TOKEN_SERVICE] ✅ Tokens used:`, {
                userId: userId.substring(0, 8) + '...',
                amount: usage.amount,
                description: usage.description,
                newBalance,
                transactionId: transaction.id
            });
            return transaction;
        }
        catch (error) {
            console.error("Use tokens error:", error);
            throw error;
        }
    }
    /**
     * Add tokens to user (credit)
     */
    static async creditTokens(userId, amount, description, transactionType = 'credit') {
        try {
            // Get current balance
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("token")
                .eq("id", userId)
                .eq("active", true)
                .single();
            if (userError || !userData) {
                throw new Error("User not found or inactive");
            }
            // Update user balance
            const newBalance = userData.token + amount;
            const { error: updateError } = await supabase
                .from("users")
                .update({ token: newBalance })
                .eq("id", userId);
            if (updateError) {
                handleSupabaseError(updateError, "token ekleme güncellemesi");
            }
            // Record transaction
            const transaction = await this.recordTransaction(userId, {
                transaction_type: transactionType,
                amount: amount, // positive for credit
                description,
                try_on_id: null
            });
            console.log(`[TOKEN_SERVICE] ✅ Tokens credited:`, {
                userId: userId.substring(0, 8) + '...',
                amount,
                type: transactionType,
                description,
                newBalance,
                transactionId: transaction.id
            });
            return transaction;
        }
        catch (error) {
            console.error("Credit tokens error:", error);
            throw error;
        }
    }
    /**
     * Give free tokens to new users
     */
    static async giveWelcomeTokens(userId) {
        return this.creditTokens(userId, this.FREE_TOKENS_ON_SIGNUP, "Welcome gift - 3 free tokens", "gift");
    }
    /**
     * Get user's token transaction history
     */
    static async getTransactionHistory(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from("token_transactions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error) {
                handleSupabaseError(error, "token işlem geçmişi sorgulama");
            }
            return data;
        }
        catch (error) {
            console.error("Get transaction history error:", error);
            throw error;
        }
    }
    /**
     * Record a token transaction
     */
    static async recordTransaction(userId, transaction) {
        try {
            const { data, error } = await supabase
                .from("token_transactions")
                .insert({
                user_id: userId,
                ...transaction
            })
                .select("*")
                .single();
            if (error) {
                handleSupabaseError(error, "token işlem kaydı");
            }
            return data;
        }
        catch (error) {
            console.error("Record transaction error:", error);
            throw error;
        }
    }
    /**
     * Refund tokens (for failed operations)
     */
    static async refundTokens(userId, amount, reason, originalTryOnId) {
        return this.creditTokens(userId, amount, `Refund: ${reason}`, "refund");
    }
    /**
     * Get token cost for specific operation
     */
    static getTokenCost(operationType) {
        return this.TOKEN_COSTS[operationType];
    }
    /**
     * Validate and use tokens for a try-on operation
     */
    static async validateAndUseTokensForTryOn(userId, operationType, tryOnId) {
        try {
            const cost = this.getTokenCost(operationType);
            const hasSufficient = await this.hasSufficientTokens(userId, cost);
            if (!hasSufficient) {
                return {
                    success: false,
                    error: "Insufficient token balance for this operation"
                };
            }
            const transaction = await this.useTokens(userId, {
                amount: cost,
                description: `${operationType.replace(/_/g, ' ')} operation`,
                try_on_id: tryOnId
            });
            return {
                success: true,
                transaction
            };
        }
        catch (error) {
            console.error("Validate and use tokens error:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
//# sourceMappingURL=tokenService.js.map