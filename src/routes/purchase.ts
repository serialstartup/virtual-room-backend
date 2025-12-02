import express from "express";
import { PurchaseController } from "../controllers/purchase.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.post("/verify", authenticateToken, PurchaseController.verifyPurchase);

export const purchaseRoutes = router;
