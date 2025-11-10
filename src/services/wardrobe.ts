import { supabase, handleSupabaseError, validateUserId } from './supabase.js'
import { Wardrobe, UpdateWardrobeRequest, UserFavorites, UserStats } from '../types/index.js'

export const wardrobeService = {
  async addToWardrobe(userId: string, tryOnId: string, liked?: boolean | null): Promise<Wardrobe> {
    try {
      validateUserId(userId)

      const { data: existing } = await supabase
        .from('wardrobe')
        .select('id')
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .single()

      if (existing) {
        return await this.updateWardrobeItem(userId, tryOnId, { liked })
      }

      const { data, error } = await supabase
        .from('wardrobe')
        .insert({
          user_id: userId,
          try_on_id: tryOnId,
          liked,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'adding to wardrobe')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'adding to wardrobe')
      throw error
    }
  },

  async updateWardrobeItem(userId: string, tryOnId: string, updates: UpdateWardrobeRequest): Promise<Wardrobe> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('wardrobe')
        .update({ liked: updates.liked })
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'updating wardrobe item')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'updating wardrobe item')
      throw error
    }
  },

  async removeFromWardrobe(userId: string, tryOnId: string): Promise<void> {
    try {
      validateUserId(userId)

      const { error } = await supabase
        .from('wardrobe')
        .delete()
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)

      if (error) {
        handleSupabaseError(error, 'removing from wardrobe')
      }
    } catch (error) {
      handleSupabaseError(error, 'removing from wardrobe')
      throw error
    }
  },

  async getWardrobe(userId: string): Promise<Wardrobe[]> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('wardrobe')
        .select(`
          *,
          try_on:try_on(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getting wardrobe')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'getting wardrobe')
      throw error
    }
  },

  async getFavorites(userId: string): Promise<UserFavorites[]> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_to_wardrobe_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getting favorites')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'getting favorites')
      throw error
    }
  },

  async getDisliked(userId: string): Promise<Wardrobe[]> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('wardrobe')
        .select(`
          *,
          try_on:try_on(*)
        `)
        .eq('user_id', userId)
        .eq('liked', false)
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getting disliked items')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'getting disliked items')
      throw error
    }
  },

  async getUndecided(userId: string): Promise<Wardrobe[]> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('wardrobe')
        .select(`
          *,
          try_on:try_on(*)
        `)
        .eq('user_id', userId)
        .is('liked', null)
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getting undecided items')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'getting undecided items')
      throw error
    }
  },

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      validateUserId(userId)

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        handleSupabaseError(error, 'getting user stats')
      }

      return data
    } catch (error) {
      handleSupabaseError(error, 'getting user stats')
      throw error
    }
  },

  async toggleLike(userId: string, tryOnId: string): Promise<Wardrobe> {
    try {
      validateUserId(userId)

      const { data: current } = await supabase
        .from('wardrobe')
        .select('liked')
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .single()

      let newLikedStatus: boolean | null

      if (current?.liked === true) {
        newLikedStatus = null
      } else {
        newLikedStatus = true
      }

      return await this.updateWardrobeItem(userId, tryOnId, { liked: newLikedStatus })
    } catch (error) {
      handleSupabaseError(error, 'toggling like')
      throw error
    }
  },

  async toggleDislike(userId: string, tryOnId: string): Promise<Wardrobe> {
    try {
      validateUserId(userId)

      const { data: current } = await supabase
        .from('wardrobe')
        .select('liked')
        .eq('user_id', userId)
        .eq('try_on_id', tryOnId)
        .single()

      let newLikedStatus: boolean | null

      if (current?.liked === false) {
        newLikedStatus = null
      } else {
        newLikedStatus = false
      }

      return await this.updateWardrobeItem(userId, tryOnId, { liked: newLikedStatus })
    } catch (error) {
      handleSupabaseError(error, 'toggling dislike')
      throw error
    }
  },
}