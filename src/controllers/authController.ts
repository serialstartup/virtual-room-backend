import type { Request, Response } from "express";
import { AuthService } from "../services/auth.js";
import { signupSchema, loginSchema, updateUserSchema } from "../validations/authValidation.js";
import type { AuthResponse, JWTPayload, AuthenticatedRequest } from "../types/auth.js";
import { z } from "zod";

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`[AUTH_CONTROLLER] 📝 Signup started - RequestID: ${requestId}`);
    console.log(`[AUTH_CONTROLLER] 📬 Request body:`, {
      email: req.body?.email || 'missing',
      hasPassword: !!req.body?.password,
      name: req.body?.name || 'not provided'
    });
    console.log(`[AUTH_CONTROLLER] 🌍 Accept-Language:`, req.headers['accept-language']);

    try {
      const validatedData = signupSchema.parse(req.body);
      console.log(`[AUTH_CONTROLLER] ✅ Validation successful - RequestID: ${requestId}`);

      const acceptLanguage = req.headers['accept-language'] as string;
      const user = await AuthService.signup(validatedData, acceptLanguage);
      console.log(`[AUTH_CONTROLLER] 👤 User created - RequestID: ${requestId}, UserID: ${user.id}`);

      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = AuthService.generateJWT(jwtPayload);
      console.log(`[AUTH_CONTROLLER] 🎫 JWT generated - RequestID: ${requestId}`);

      const response: AuthResponse = {
        success: true,
        data: {
          user,
          token,
          expires_in: 7 * 24 * 60 * 60,
        },
      };

      const duration = Date.now() - startTime;
      console.log(`[AUTH_CONTROLLER] ✅ Signup successful - RequestID: ${requestId} (${duration}ms)`);
      res.status(201).json(response);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[AUTH_CONTROLLER] 🚨 Signup error - RequestID: ${requestId} (${duration}ms):`, error);

      let statusCode = 500;
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (error instanceof z.ZodError) {
        statusCode = 400;
        errorMessage = error.issues[0].message;
        console.log(`[AUTH_CONTROLLER] ❌ Validation error - RequestID: ${requestId}:`, error.issues);
      } else if (error.message) {
        statusCode = 400;
        errorMessage = error.message;
        console.log(`[AUTH_CONTROLLER] ❌ Service error - RequestID: ${requestId}:`, error.message);
      }

      const response: AuthResponse = {
        success: false,
        error: errorMessage,
      };

      res.status(statusCode).json(response);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`[AUTH_CONTROLLER] 🔑 Login started - RequestID: ${requestId}`);
    console.log(`[AUTH_CONTROLLER] 📬 Request body:`, {
      email: req.body?.email || 'missing',
      hasPassword: !!req.body?.password
    });

    try {
      const validatedData = loginSchema.parse(req.body);
      console.log(`[AUTH_CONTROLLER] ✅ Login validation successful - RequestID: ${requestId}`);

      const user = await AuthService.login(validatedData);
      console.log(`[AUTH_CONTROLLER] 👤 User authenticated - RequestID: ${requestId}, UserID: ${user.id}`);

      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = AuthService.generateJWT(jwtPayload);
      console.log(`[AUTH_CONTROLLER] 🎫 JWT generated for login - RequestID: ${requestId}`);

      const response: AuthResponse = {
        success: true,
        data: {
          user,
          token,
          expires_in: 7 * 24 * 60 * 60,
        },
      };

      const duration = Date.now() - startTime;
      console.log(`[AUTH_CONTROLLER] ✅ Login successful - RequestID: ${requestId} (${duration}ms)`);
      res.status(200).json(response);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[AUTH_CONTROLLER] 🚨 Login error - RequestID: ${requestId} (${duration}ms):`, error);

      let statusCode = 500;
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (error instanceof z.ZodError) {
        statusCode = 400;
        errorMessage = error.issues[0].message;
        console.log(`[AUTH_CONTROLLER] ❌ Login validation error - RequestID: ${requestId}:`, error.issues);
      } else if (error.message) {
        statusCode = 401;
        errorMessage = error.message;
        console.log(`[AUTH_CONTROLLER] ❌ Login authentication error - RequestID: ${requestId}:`, error.message);
      }

      const response: AuthResponse = {
        success: false,
        error: errorMessage,
      };

      res.status(statusCode).json(response);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "Çıkış başarılı"
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Çıkış işlemi başarısız"
      });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`[AUTH_CONTROLLER] 👤 Me endpoint called - RequestID: ${requestId}`);
    console.log(`[AUTH_CONTROLLER] 🎫 Auth header present:`, !!req.headers.authorization);

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log(`[AUTH_CONTROLLER] ❌ Missing or invalid auth header - RequestID: ${requestId}`);
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const token = authHeader.substring(7);
      console.log(`[AUTH_CONTROLLER] 🔍 Token extracted - RequestID: ${requestId}`);

      const decoded = AuthService.verifyJWT(token);
      console.log(`[AUTH_CONTROLLER] ✅ Token verified - RequestID: ${requestId}, UserID: ${decoded.userId}`);

      const user = await AuthService.getUserById(decoded.userId);

      if (!user) {
        console.log(`[AUTH_CONTROLLER] ❌ User not found - RequestID: ${requestId}, UserID: ${decoded.userId}`);
        res.status(404).json({
          success: false,
          error: "Kullanıcı bulunamadı",
        });
        return;
      }

      const duration = Date.now() - startTime;
      console.log(`[AUTH_CONTROLLER] ✅ Me endpoint successful - RequestID: ${requestId} (${duration}ms)`);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[AUTH_CONTROLLER] 🚨 Me endpoint error - RequestID: ${requestId} (${duration}ms):`, error);

      let statusCode = 401;
      let errorMessage = "Token doğrulama başarısız";

      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('Token süresi dolmuş')) {
          console.log(`[AUTH_CONTROLLER] ⏰ Token expired - RequestID: ${requestId}`);
        } else if (error.message.includes('Geçersiz token')) {
          console.log(`[AUTH_CONTROLLER] 🚫 Invalid token - RequestID: ${requestId}`);
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
