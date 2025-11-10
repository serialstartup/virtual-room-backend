import type { Request, Response } from "express";
import { AuthService } from "../services/auth.js";
import { UserService } from "../services/user.js";
import { updateUserSchema } from "../validations/authValidation.js";
import type { AuthenticatedRequest, UpdateUserSettingsRequest } from "../types/auth.js";
import { z } from "zod";

export class UserController {
  static async updateUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const updatedUser = await AuthService.updateUser(userId, validatedData);

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error: any) {
      console.error("Update user controller error:", error);

      let statusCode = 500;
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (error instanceof z.ZodError) {
        statusCode = 400;
        errorMessage = error.issues[0].message;
      } else if (error.message) {
        statusCode = 400;
        errorMessage = error.message;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  static async deleteUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      await AuthService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: "Hesap başarıyla silindi",
      });
    } catch (error: any) {
      console.error("Delete user controller error:", error);

      res.status(500).json({
        success: false,
        error: "Hesap silinirken hata oluştu",
      });
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: "Kullanıcı ID gereklidir",
        });
        return;
      }

      const user = await AuthService.getUserById(userId);

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
      console.error("Get user controller error:", error);

      res.status(500).json({
        success: false,
        error: "Kullanıcı bilgileri alınırken hata oluştu",
      });
    }
  }

  static async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error: any) {
      console.error("Get all users controller error:", error);

      res.status(500).json({
        success: false,
        error: "Kullanıcı listesi alınırken hata oluştu"
      });
    }
  }

  static async getUserSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const settings = await UserService.getUserSettings(userId);

      if (!settings) {
        res.status(404).json({
          success: false,
          error: "Kullanıcı ayarları bulunamadı",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { settings },
      });
    } catch (error: any) {
      console.error("Get user settings controller error:", error);

      res.status(500).json({
        success: false,
        error: "Kullanıcı ayarları alınırken hata oluştu",
      });
    }
  }

  static async updateUserSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const updates: UpdateUserSettingsRequest = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const updatedSettings = await UserService.updateUserSettings(userId, updates);

      res.status(200).json({
        success: true,
        data: { settings: updatedSettings },
      });
    } catch (error: any) {
      console.error("Update user settings controller error:", error);

      res.status(500).json({
        success: false,
        error: "Kullanıcı ayarları güncellenirken hata oluştu",
      });
    }
  }

  static async getNotificationSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Token gereklidir",
        });
        return;
      }

      const notifications = await UserService.getNotificationSettings(userId);

      if (!notifications) {
        res.status(404).json({
          success: false,
          error: "Bildirim ayarları bulunamadı",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { notifications },
      });
    } catch (error: any) {
      console.error("Get notification settings controller error:", error);

      res.status(500).json({
        success: false,
        error: "Bildirim ayarları alınırken hata oluştu",
      });
    }
  }
}

