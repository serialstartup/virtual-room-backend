import { supabase } from './supabase.js';

export type FeedbackType = 'like' | 'dislike' | 'neutral';
export type FeedbackSource = 'heart' | 'thumbs';
export type WorkflowType = 'classic' | 'avatar' | 'text-to-fashion' | 'product-to-model';

export interface TryOnFeedback {
  id: string;
  user_id: string;
  try_on_id: string;
  try_on_type: WorkflowType;
  feedback_type: FeedbackType;
  feedback_source: FeedbackSource;
  created_at: string;
  updated_at: string;
}

export class FeedbackService {
  // Get existing feedback for a specific try-on and source
  static async getFeedback(
    userId: string,
    tryOnId: string,
    feedbackSource: FeedbackSource
  ): Promise<TryOnFeedback | null> {
    try {
      const { data, error } = await supabase
        .from('try_on_feedback')
        .select('*')
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .eq('feedback_source', feedbackSource)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[FeedbackService] Error getting feedback:', error);
      throw error;
    }
  }

  // Set or update feedback
  static async setFeedback(
    userId: string,
    tryOnId: string,
    tryOnType: WorkflowType,
    feedbackSource: FeedbackSource,
    feedbackType: FeedbackType
  ): Promise<TryOnFeedback> {
    try {
      const feedbackData = {
        user_id: userId,
        try_on_id: tryOnId,
        try_on_type: tryOnType,
        feedback_type: feedbackType,
        feedback_source: feedbackSource,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('try_on_feedback')
        .upsert(feedbackData, {
          onConflict: 'user_id,try_on_id,feedback_source',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ [FeedbackService] ${feedbackSource} feedback set:`, {
        tryOnId,
        tryOnType,
        feedbackType
      });

      return data;
    } catch (error) {
      console.error('[FeedbackService] Error setting feedback:', error);
      throw error;
    }
  }

  // Remove feedback
  static async removeFeedback(
    userId: string,
    tryOnId: string,
    feedbackSource: FeedbackSource
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('try_on_feedback')
        .delete()
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .eq('feedback_source', feedbackSource);

      if (error) {
        throw error;
      }

      console.log(`✅ [FeedbackService] ${feedbackSource} feedback removed:`, { tryOnId });
    } catch (error) {
      console.error('[FeedbackService] Error removing feedback:', error);
      throw error;
    }
  }

  // Get all feedback for a user (for analytics)
  static async getUserFeedback(userId: string): Promise<TryOnFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('try_on_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[FeedbackService] Error getting user feedback:', error);
      throw error;
    }
  }

  // Get feedback statistics for a user
  static async getUserFeedbackStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        total_try_ons: 0,
        favorites_count: 0,
        satisfied_count: 0,
        dissatisfied_count: 0
      };
    } catch (error) {
      console.error('[FeedbackService] Error getting user feedback stats:', error);
      throw error;
    }
  }
}