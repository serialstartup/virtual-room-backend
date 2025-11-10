export interface TryOn {
  id: string
  user_id: string
  wardrobe_id: string
  person_image_url: string
  clothing_image_url: string
  result_image_url?: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  fal_request_id?: string
  created_at: string
  updated_at: string
}

export interface Wardrobe {
  id: string
  user_id: string
  try_on_id: string
  liked?: boolean | null
  created_at: string
  updated_at: string
}

export interface TryOnWithWardrobe extends TryOn {
  wardrobe: Wardrobe | null
}

export interface CreateTryOnRequest {
  wardrobe_id: string
  person_image_url: string
  clothing_image_url: string
}

export interface UpdateWardrobeRequest {
  liked?: boolean | null
}

export interface UserFavorites {
  id: string
  user_id: string
  try_on_id: string
  added_to_wardrobe_at: string
  outfit_name?: string
}

export interface UserStats {
  user_id: string
  total_try_ons: number
  favorites_count: number
  disliked_count: number
  created_at: string
  updated_at: string
}

export interface FALTryOnRequest {
  person_image_url: string
  clothing_image_url: string
  description?: string
  num_inference_steps?: number
  guidance_scale?: number
}

export interface FALTryOnResponse {
  request_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: {
    image_url: string
  }
  error?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}