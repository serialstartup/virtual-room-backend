import { supabase, handleSupabaseError, validateUserId } from './supabase.js'
import { TryOn, TryOnWithWardrobe, CreateTryOnRequest } from '../types/index.js'

export const tryOnService = {
  async createTryOn(userId: string, tryOnData: CreateTryOnRequest): Promise<TryOn> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('try_on')
        .insert({
          user_id: userId,
          ...tryOnData,
          processing_status: 'pending',
          active: true,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'creating try-on')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'creating try-on')
      throw error
    }
  },

  async getTryOns(userId: string): Promise<TryOnWithWardrobe[]> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('try_on')
        .select(`
          *,
          wardrobe:wardrobe(*)
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getting try-ons')
      }

      return (data || []).map(item => ({
        ...item,
        wardrobe: Array.isArray(item.wardrobe) ? item.wardrobe[0] || null : item.wardrobe,
      }))
    } catch (error) {
      handleSupabaseError(error, 'getting try-ons')
      throw error
    }
  },

  async getTryOn(userId: string, tryOnId: string): Promise<TryOnWithWardrobe> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('try_on')
        .select(`
          *,
          wardrobe:wardrobe(*)
        `)
        .eq('id', tryOnId)
        .eq('user_id', userId)
        .eq('active', true)
        .single()

      if (error) {
        handleSupabaseError(error, 'getting try-on')
      }

      return {
        ...data,
        wardrobe: Array.isArray(data.wardrobe) ? data.wardrobe[0] || null : data.wardrobe,
      }
    } catch (error) {
      handleSupabaseError(error, 'getting try-on')
      throw error
    }
  },

  async updateTryOn(userId: string, tryOnId: string, updates: Partial<TryOn>): Promise<TryOn> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('try_on')
        .update(updates)
        .eq('id', tryOnId)
        .eq('user_id', userId)
        .eq('active', true)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'updating try-on')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'updating try-on')
      throw error
    }
  },

  async deleteTryOn(userId: string, tryOnId: string): Promise<void> {
    try {
      validateUserId(userId)

      const { error } = await supabase
        .from('try_on')
        .update({ active: false })
        .eq('id', tryOnId)
        .eq('user_id', userId)
        .eq('active', true)

      if (error) {
        handleSupabaseError(error, 'deleting try-on')
      }
    } catch (error) {
      handleSupabaseError(error, 'deleting try-on')
      throw error
    }
  },

  async getProcessingStatus(userId: string, tryOnId: string): Promise<string> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('try_on')
        .select('processing_status')
        .eq('id', tryOnId)
        .eq('user_id', userId)
        .eq('active', true)
        .single()

      if (error) {
        handleSupabaseError(error, 'getting processing status')
      }

      return data?.processing_status || 'failed'
    } catch (error) {
      handleSupabaseError(error, 'getting processing status')
      throw error
    }
  },

  async updateProcessingStatus(
    tryOnId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    resultImageUrl?: string
  ): Promise<TryOn> {
    try {
      const updates: { 
        processing_status: 'pending' | 'processing' | 'completed' | 'failed'
        result_image?: string
      } = { 
        processing_status: status
      }
      
      if (resultImageUrl) {
        updates.result_image = resultImageUrl
      }

      const { data, error } = await supabase
        .from('try_on')
        .update(updates)
        .eq('id', tryOnId)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'updating processing status')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'updating processing status')
      throw error
    }
  },
}