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
      static async getAllUsers(): Promise<User[]> {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email, token, total_tokens_used, active, created_at, updated_at")
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
          console.log(`[USER_SERVICE] 🔍 Getting user settings for: ${userId}`);
          
          const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (error && error.code === "PGRST116") {
            console.log(`[USER_SERVICE] ❌ No settings found, creating default settings for user: ${userId}`);
            // Settings not found, create default ones ONLY
            await this.createDefaultSettingsForUser(userId);
            // Try to fetch the newly created settings
            const { data: newData, error: newError } = await supabase
              .from("user_settings")
              .select("*")
              .eq("user_id", userId)
              .single();
              
            if (newError) {
              console.error(`[USER_SERVICE] 🚨 Failed to create/fetch default settings:`, newError);
              return null;
            }
            
            console.log(`[USER_SERVICE] ✅ Default settings created and retrieved:`, newData);
            return newData as UserSettings;
          } else if (error) {
            handleSupabaseError(error, "kullanıcı ayarları sorgulama");
          }

          console.log(`[USER_SERVICE] ✅ Existing user settings retrieved (not modified):`, data);
          return data as UserSettings;
        } catch (error: any) {
          console.error(`[USER_SERVICE] 🚨 Get user settings error:`, error);
          if (error.message.includes("PGRST116")) {
            return null;
          }
          throw error;
        }
      }

      // Create default settings for users who don't have any
      static async createDefaultSettingsForUser(userId: string): Promise<void> {
        try {
          console.log(`[USER_SERVICE] 🔧 Creating default settings for user: ${userId}`);
          
          const defaultSettings = {
            user_id: userId,
            push_notifications: true,
            email_notifications: true,
            new_features: true,
            language: 'tr'
          };

          const { data, error } = await supabase
            .from("user_settings")
            .insert(defaultSettings)
            .select("*")
            .single();

          if (error) {
            console.error(`[USER_SERVICE] ❌ Failed to create default settings:`, error);
            throw error;
          } else {
            console.log(`[USER_SERVICE] ✅ Default settings created:`, data);
          }
        } catch (error: any) {
          console.error(`[USER_SERVICE] 🚨 Create default settings error:`, error);
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
          console.log(`[USER_SERVICE] 🔔 Getting notification settings for: ${userId}`);
          
          const { data, error } = await supabase
            .from("user_settings")
            .select("push_notifications, email_notifications, new_features")
            .eq("user_id", userId)
            .single();

          if (error && error.code === "PGRST116") {
            console.log(`[USER_SERVICE] ❌ No notification settings found, creating default for user: ${userId}`);
            // Settings not found, create default ones ONLY
            await this.createDefaultSettingsForUser(userId);
            // Try to fetch the newly created notification settings
            const { data: newData, error: newError } = await supabase
              .from("user_settings")
              .select("push_notifications, email_notifications, new_features")
              .eq("user_id", userId)
              .single();
              
            if (newError) {
              console.error(`[USER_SERVICE] 🚨 Failed to create/fetch notification settings:`, newError);
              return null;
            }
            
            console.log(`[USER_SERVICE] ✅ Default notification settings created and retrieved:`, newData);
            return newData;
          } else if (error) {
            handleSupabaseError(error, "bildirim ayarları sorgulama");
          }

          console.log(`[USER_SERVICE] ✅ Existing notification settings retrieved (not modified):`, data);
          return data;
        } catch (error: any) {
          console.error(`[USER_SERVICE] 🚨 Get notification settings error:`, error);
          if (error.message.includes("PGRST116")) {
            return null;
          }
          throw error;
        }
      }
}