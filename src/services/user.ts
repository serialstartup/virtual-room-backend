import { supabase, handleSupabaseError } from "./supabase.js";
import type {
  User,
  UpdateUserRequest,
  UserSettings,
  UpdateUserSettingsRequest,
} from "../types/auth.js";

export class UserService {
      static async getUserById(userId: string): Promise<User | null> {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email, premium_status, active, created_at, updated_at")
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
            .select("id, name, email, premium_status, active, created_at, updated_at")
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
      static async getAllUsers(): Promise<User[]> {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email, premium_status, active, created_at, updated_at")
            .eq("active", true)
            .order("created_at", { ascending: false });

          if (error) {
            handleSupabaseError(error, "kullanıcı listeleme");
          }

          return data as User[];
        } catch (error: any) {
          console.error("Get all users error:", error);
          throw error;
        }
      }

      static async getUserSettings(userId: string): Promise<UserSettings | null> {
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (error && error.code !== "PGRST116") {
            handleSupabaseError(error, "kullanıcı ayarları sorgulama");
          }

          return data as UserSettings;
        } catch (error: any) {
          if (error.message.includes("PGRST116")) {
            return null;
          }
          throw error;
        }
      }

      static async updateUserSettings(userId: string, settings: UpdateUserSettingsRequest): Promise<UserSettings> {
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .update(settings)
            .eq("user_id", userId)
            .select("*")
            .single();

          if (error) {
            handleSupabaseError(error, "kullanıcı ayarları güncelleme");
          }

          return data as UserSettings;
        } catch (error: any) {
          console.error("Update user settings error:", error);
          throw error;
        }
      }

      static async getNotificationSettings(userId: string): Promise<{ push_notifications: boolean; email_notifications: boolean; new_features: boolean } | null> {
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .select("push_notifications, email_notifications, new_features")
            .eq("user_id", userId)
            .single();

          if (error && error.code !== "PGRST116") {
            handleSupabaseError(error, "bildirim ayarları sorgulama");
          }

          return data;
        } catch (error: any) {
          if (error.message.includes("PGRST116")) {
            return null;
          }
          throw error;
        }
      }
}