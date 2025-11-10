import type { Request, Response } from "express";
import { AuthService } from "../services/auth.js";
import { signupSchema, loginSchema, updateUserSchema } from "../validations/authValidation.js";
import type { AuthResponse, JWTPayload, AuthenticatedRequest } from "../types/auth.js";
import { z } from "zod";

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = signupSchema.parse(req.body);
      const acceptLanguage = req.headers['accept-language'] as string;

      const user = await AuthService.signup(validatedData, acceptLanguage);

      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = AuthService.generateJWT(jwtPayload);

      const response: AuthResponse = {
        success: true,
        data: {
          user,
          token,
          expires_in: 7 * 24 * 60 * 60,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Signup controller error:", error);

      let statusCode = 500;
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (error instanceof z.ZodError) {
        statusCode = 400;
        errorMessage = error.issues[0].message;
      } else if (error.message) {
        statusCode = 400;
        errorMessage = error.message;
      }

      const response: AuthResponse = {
        success: false,
        error: errorMessage,
      };

      res.status(statusCode).json(response);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await AuthService.login(validatedData);

      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = AuthService.generateJWT(jwtPayload);

      const response: AuthResponse = {
        success: true,
        data: {
          user,
          token,
          expires_in: 7 * 24 * 60 * 60,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error("Login controller error:", error);

      let statusCode = 500;
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (error instanceof z.ZodError) {
        statusCode = 400;
        errorMessage = error.issues[0].message;
      } else if (error.message) {
        statusCode = 401;
        errorMessage = error.message;
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
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = AuthService.verifyJWT(token);

      const user = await AuthService.getUserById(decoded.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: "Kullanıcı bulunamadı",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error("Me controller error:", error);

      let statusCode = 401;
      let errorMessage = "Token doğrulama başarısız";

      if (error.message) {
        errorMessage = error.message;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
