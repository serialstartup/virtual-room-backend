export interface TryOn {
    id: string;
    user_id: string;
    self_image?: string;
    model_image?: string;
    dress_description?: string;
    dress_image?: string;
    product_url?: string;
    result_image?: string;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    active: boolean;
    created_at: string;
    updated_at?: string;
}
export interface Wardrobe {
    id: string;
    user_id: string;
    try_on_id: string;
    liked?: boolean | null;
    created_at: string;
    updated_at: string;
}
export interface TryOnWithWardrobe extends TryOn {
    wardrobe: Wardrobe | null;
}
export interface CreateTryOnRequest {
    self_image?: string;
    model_image?: string;
    avatar_id?: string;
    dress_description?: string;
    dress_image?: string;
    product_url?: string;
}
export interface UpdateWardrobeRequest {
    liked?: boolean | null;
}
export interface UserFavorites {
    id: string;
    user_id: string;
    try_on_id: string;
    added_to_wardrobe_at: string;
    outfit_name?: string;
}
export interface UserStats {
    user_id: string;
    total_try_ons: number;
    favorites_count: number;
    disliked_count: number;
    created_at: string;
    updated_at: string;
}
export interface UserModel {
    id: string;
    user_id: string;
    name: string;
    prompt: string;
    image_url?: string;
    model_type: 'model-create' | 'product-to-model';
    status: 'processing' | 'completed' | 'failed';
    fashion_ai_request_id?: string;
    created_at: string;
    updated_at: string;
}
export interface CreateUserModelRequest {
    name: string;
    prompt: string;
    model_type: 'model-create' | 'product-to-model';
    product_image?: string;
}
export interface UpdateUserModelRequest {
    name?: string;
    status?: 'processing' | 'completed' | 'failed';
    image_url?: string;
}
export interface UserAvatar {
    id: string;
    user_id: string;
    name: string;
    face_image_url: string;
    avatar_image_url?: string;
    status: 'processing' | 'completed' | 'failed';
    fashion_ai_request_id?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}
export interface CreateUserAvatarRequest {
    name: string;
    face_image_url: string;
}
export interface UpdateUserAvatarRequest {
    name?: string;
    is_primary?: boolean;
}
export interface AvatarTryOn {
    id: string;
    user_id: string;
    avatar_id: string;
    garment_image_url?: string;
    garment_description?: string;
    result_image_url?: string;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    fashion_ai_request_id?: string;
    try_on_type: 'classic' | 'text-to-fashion' | 'product-to-model';
    created_at: string;
    updated_at: string;
}
export interface CreateAvatarTryOnRequest {
    avatar_id: string;
    garment_image_url?: string;
    garment_description?: string;
    try_on_type: 'classic' | 'text-to-fashion' | 'product-to-model';
}
export interface ProductShowcase {
    id: string;
    user_id: string;
    product_name: string;
    product_image_url: string;
    showcase_image_url?: string;
    product_description?: string;
    scene_prompt?: string;
    status: 'processing' | 'completed' | 'failed';
    fashion_ai_request_id?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}
export interface CreateProductShowcaseRequest {
    product_name: string;
    product_image_url: string;
    product_description?: string;
    scene_prompt?: string;
    is_public?: boolean;
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
