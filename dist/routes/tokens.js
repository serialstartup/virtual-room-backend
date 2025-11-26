import { Router } from "express";
import { TokenController } from "../controllers/tokenController.js";
import { authenticateToken } from "../middleware/auth.js";
const tokenRoutes = Router();
// All token routes require authentication
tokenRoutes.use(authenticateToken);
// Get user's token balance and statistics
tokenRoutes.get("/balance", TokenController.getTokenBalance);
// Get user's token transaction history
tokenRoutes.get("/history", TokenController.getTransactionHistory);
// Purchase tokens (placeholder for payment integration)
tokenRoutes.post("/purchase", TokenController.purchaseTokens);
// Get available token packages and pricing
tokenRoutes.get("/packages", TokenController.getTokenPackages);
// Get token costs for different operations
tokenRoutes.get("/costs", TokenController.getTokenCosts);
// Admin only: Credit tokens to a user (for testing/support)
tokenRoutes.post("/admin/credit", TokenController.adminCreditTokens);
export { tokenRoutes };
//# sourceMappingURL=tokens.js.map