import { supabase } from './supabase.js';

export interface SaveEmailData {
  email: string;
  status?: string;
}

export interface SaveEmailResponse {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export class SaveEmailService {
  static async saveEmail(emailData: SaveEmailData): Promise<SaveEmailResponse> {
    try {
      const { email, status = 'active' } = emailData;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists
      const { data: existingEmail, error: checkError } = await supabase
        .from('save_email')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (existingEmail) {
        // Email already exists, return existing record
        return existingEmail;
      }

      // Insert new email
      const { data, error } = await supabase
        .from('save_email')
        .insert([{ email, status }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SaveEmailService error:', error);
      throw error;
    }
  }

  static async getAllEmails(): Promise<SaveEmailResponse[]> {
    try {
      const { data, error } = await supabase
        .from('save_email')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch emails: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('SaveEmailService getAllEmails error:', error);
      throw error;
    }
  }

  static async getEmailById(id: number): Promise<SaveEmailResponse | null> {
    try {
      const { data, error } = await supabase
        .from('save_email')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No record found
        }
        throw new Error(`Failed to fetch email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SaveEmailService getEmailById error:', error);
      throw error;
    }
  }

  static async updateEmailStatus(id: number, status: string): Promise<SaveEmailResponse> {
    try {
      const { data, error } = await supabase
        .from('save_email')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update email status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SaveEmailService updateEmailStatus error:', error);
      throw error;
    }
  }

  static async deleteEmail(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('save_email')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete email: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('SaveEmailService deleteEmail error:', error);
      throw error;
    }
  }
}