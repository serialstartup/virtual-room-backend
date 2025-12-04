import axios from "axios";
import { TokenService } from "../services/tokenService.js";
import { supabase } from "../services/supabase.js";
export class PurchaseController {
    /**
     * Verify purchase with RevenueCat and credit tokens
     */
    static async verifyPurchase(req, res) {
        try {
            const userId = req.user.userId;
            const { appUserId, platform, productId, transactionId } = req.body;
            if (!appUserId || !platform || !productId) {
                res.status(400).json({
                    success: false,
                    error: "appUserId, platform, and productId are required",
                });
                return;
            }
            console.log(`[PURCHASE] 🧾 Verifying purchase for user ${userId}`, {
                appUserId,
                platform,
                productId,
                transactionId,
            });
            // 1. Check if we already processed this transaction
            if (transactionId) {
                const { data: existingTransaction } = await supabase
                    .from("token_transactions")
                    .select("id")
                    .ilike("description", `%RC: ${transactionId}%`)
                    .single();
                if (existingTransaction) {
                    console.log(`[PURCHASE] ⚠️ Transaction ${transactionId} already processed`);
                    res.json({
                        success: true,
                        message: "Transaction already processed",
                        data: { alreadyProcessed: true },
                    });
                    return;
                }
            }
            // 2. Verify with RevenueCat
            const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET_KEY;
            if (!REVENUECAT_SECRET) {
                throw new Error("REVENUECAT_SECRET_KEY is not configured");
            }
            const rcResponse = await axios.get(`https://api.revenuecat.com/v1/subscribers/${appUserId}`, {
                headers: {
                    Authorization: `Bearer ${REVENUECAT_SECRET}`,
                    "Content-Type": "application/json",
                    "X-Platform": platform,
                },
            });
            const subscriber = rcResponse.data.subscriber;
            // Check non-subscription purchases
            // RevenueCat returns all non-subscription purchases in `non_subscriptions`
            // It's a map of productId -> array of purchases
            const purchases = subscriber.non_subscriptions[productId];
            if (!purchases || purchases.length === 0) {
                console.error(`[PURCHASE] ❌ No purchases found for product ${productId}`);
                res.status(400).json({
                    success: false,
                    error: "Purchase not found in RevenueCat",
                });
                return;
            }
            // Find the purchase that matches the transactionId if provided, or the latest one
            let validPurchase = null;
            if (transactionId) {
                validPurchase = purchases.find((p) => p.store_transaction_id === transactionId || p.id === transactionId);
            }
            else {
                // If no transactionId provided (should not happen with proper mobile impl), take the latest
                // But this is risky for duplicates. We'll rely on transactionId.
                // Sort by purchase_date desc
                validPurchase = purchases.sort((a, b) => new Date(b.purchase_date).getTime() -
                    new Date(a.purchase_date).getTime())[0];
            }
            if (!validPurchase) {
                console.error(`[PURCHASE] ❌ Matching purchase not found for transaction ${transactionId}`);
                res.status(400).json({
                    success: false,
                    error: "Matching purchase not found",
                });
                return;
            }
            // 3. Determine tokens to add
            let tokensToAdd = 0;
            switch (productId) {
                case "token_50":
                    tokensToAdd = 50;
                    break;
                case "token_100":
                    tokensToAdd = 100;
                    break;
                case "token_250":
                    tokensToAdd = 250;
                    break;
                default:
                    // Try to parse from ID if it follows pattern
                    const match = productId.match(/token_(\d+)/);
                    if (match) {
                        tokensToAdd = parseInt(match[1], 10);
                    }
                    else {
                        console.error(`[PURCHASE] ❌ Unknown product ID: ${productId}`);
                        res.status(400).json({
                            success: false,
                            error: "Unknown product ID",
                        });
                        return;
                    }
            }
            // 4. Credit tokens
            const description = `Purchase: ${productId} (RC: ${transactionId || validPurchase.id})`;
            const transaction = await TokenService.creditTokens(userId, tokensToAdd, description, "purchase");
            console.log(`[PURCHASE] ✅ Successfully credited ${tokensToAdd} tokens`);
            const response = {
                success: true,
                data: transaction,
            };
            res.json(response);
        }
        catch (error) {
            console.error("Verify purchase error:", error.response?.data || error.message);
            const response = {
                success: false,
                error: error.message || "Failed to verify purchase",
            };
            res.status(500).json(response);
        }
    }
}
//# sourceMappingURL=purchase.controller.js.map