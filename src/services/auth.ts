import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase, handleSupabaseError } from "./supabase.js";
import { createNameFromEmail } from "../helper/convert.js";
import { TokenService } from "./tokenService.js";
import type {
  User,
  UserWithPassword,
  SignupRequest,
  LoginRequest,
  UpdateUserRequest,
  JWTPayload,
} from "../types/auth.js";
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

export class AuthService {
  private static saltRounds = 12;

  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error("Şifre hashleme işlemi başarısız oldu");
    }
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error("Şifre doğrulama işlemi başarısız oldu");
    }
  }

  static generateJWT(payload: JWTPayload): string {
    try {
      const options: any = {
        expiresIn: JWT_EXPIRY,
        issuer: "virtual-room-backend",
      };
      return jwt.sign(payload, JWT_SECRET as string, options);
    } catch (error) {
      throw new Error("Token oluşturma işlemi başarısız oldu");
    }
  }

  static verifyJWT(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw new Error("Token verification failed");
    }
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        handleSupabaseError(error, "email kontrolü");
      }

      return !!data;
    } catch (error: any) {
      if (error.message.includes("PGRST116")) {
        return false;
      }
      throw error;
    }
  }

  static async signup(userData: SignupRequest, acceptLanguage?: string): Promise<User> {
    try {
      const emailExists = await this.checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error("Bu email adresi zaten kullanılıyor");
      }

      const hashedPassword = await this.hashPassword(userData.password);
      const firstName = userData.name || createNameFromEmail(userData.email);

      const { data, error } = await supabase
        .from("users")
        .insert({
          name: firstName,
          email: userData.email,
          password_hash: hashedPassword,
          active: true,
        })
        .select("id, name, email, token, total_tokens_used, active, created_at, updated_at")
        .single();

      if (error) {
        handleSupabaseError(error, "kullanıcı kaydı");
      }

      const user = data as User;

      // Create default user settings
      await this.createDefaultUserSettings(user.id, acceptLanguage);

      // Create default user stats
      await this.createDefaultUserStats(user.id);

      // Give welcome tokens to new user
      try {
        await TokenService.giveWelcomeTokens(user.id);
        console.log(`[AUTH_SERVICE] ✅ Welcome tokens given to user: ${user.id}`);
      } catch (tokenError) {
        console.error(`[AUTH_SERVICE] ❌ Failed to give welcome tokens:`, tokenError);
        // Don't throw error, let signup succeed even if token gift fails
      }

      return user;
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  private static async createDefaultUserSettings(userId: string, acceptLanguage?: string): Promise<void> {
    try {
      console.log(`[AUTH_SERVICE] 🔧 Creating default settings for user: ${userId}`);
      
      // Detect language from Accept-Language header or default to 'tr'
      let language = 'tr';
      if (acceptLanguage) {
        // Parse Accept-Language header (e.g., "tr-TR,tr;q=0.9,en;q=0.8")
        const languages = acceptLanguage.toLowerCase().split(',');
        const primaryLang = languages[0]?.split('-')[0]?.split(';')[0];
        language = primaryLang === 'en' ? 'en' : 'tr';
      }

      console.log(`[AUTH_SERVICE] 🌍 Detected language: ${language}`);

      const settingsData = {
        user_id: userId,
        push_notifications: true,
        email_notifications: true,
        new_features: true,
        language: language
      };

      console.log(`[AUTH_SERVICE] 📋 Inserting settings:`, settingsData);

      const { data, error } = await supabase
        .from("user_settings")
        .insert(settingsData)
        .select("*")
        .single();

      if (error) {
        console.error(`[AUTH_SERVICE] ❌ Default user settings creation failed:`, error);
        // Don't throw error, let signup succeed even if settings creation fails
      } else {
        console.log(`[AUTH_SERVICE] ✅ Default user settings created:`, data);
      }
    } catch (error: any) {
      console.error(`[AUTH_SERVICE] 🚨 Default user settings creation error:`, error);
    }
  }

  private static async createDefaultUserStats(userId: string): Promise<void> {
    try {
      console.log(`[AUTH_SERVICE] 📊 Creating default stats for user: ${userId}`);

      const statsData = {
        user_id: userId,
        total_try_ons: 0,
        favorites_count: 0,
        disliked_count: 0,
        undecided_count: 0
      };

      console.log(`[AUTH_SERVICE] 📊 Inserting stats:`, statsData);

      const { data, error } = await supabase
        .from("user_stats")
        .insert(statsData)
        .select("*")
        .single();

      if (error) {
        console.error(`[AUTH_SERVICE] ❌ Default user stats creation failed:`, error);
        // Don't throw error, let signup succeed even if stats creation fails
      } else {
        console.log(`[AUTH_SERVICE] ✅ Default user stats created:`, data);
      }
    } catch (error: any) {
      console.error(`[AUTH_SERVICE] 🚨 Default user stats creation error:`, error);
    }
  }

  static async login(credentials: LoginRequest): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", credentials.email)
        .eq("active", true)
        .single();

      if (error || !data) {
        throw new Error("Email veya şifre hatalı");
      }

      const userWithPassword = data as UserWithPassword;
      const isValidPassword = await this.verifyPassword(
        credentials.password,
        userWithPassword.password_hash
      );

      if (!isValidPassword) {
        throw new Error("Email veya şifre hatalı");
      }

      const { password_hash, ...user } = userWithPassword;
      return user as User;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, token, total_tokens_used, active, created_at, updated_at")
        .eq("id", userId)
        .eq("active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        handleSupabaseError(error, "kullanıcı sorgulama");
      }

      return data as User;
    } catch (error: any) {
      if (error.message.includes("PGRST116")) {
        return null;
      }
      throw error;
    }
  }

  static async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name: userData.name })
        .eq("id", userId)
        .eq("active", true)
        .select("id, name, email, token, total_tokens_used, active, created_at, updated_at")
        .single();

      if (error) {
        handleSupabaseError(error, "kullanıcı güncelleme");
      }

      return data as User;
    } catch (error: any) {
      console.error("Update user error:", error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ active: false })
        .eq("id", userId);

      if (error) {
        handleSupabaseError(error, "kullanıcı silme");
      }
    } catch (error: any) {
      console.error("Delete user error:", error);
      throw error;
    }
  }

  // Helper method to create default settings for existing users
  static async createDefaultUserSettingsForExistingUser(userId: string): Promise<void> {
    console.log(`[AUTH_SERVICE] 🔄 Creating default settings for existing user: ${userId}`);
    return this.createDefaultUserSettings(userId, 'tr');
  }
}
