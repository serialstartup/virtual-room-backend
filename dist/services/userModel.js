import { supabase, handleSupabaseError, validateUserId } from './supabase.js';
export const userModelService = {
    async createUserModel(userId, data) {
        try {
            validateUserId(userId);
            console.log('[USER_MODEL_SERVICE] 🎨 Creating user model:', {
                userId: userId.substring(0, 8) + '...',
                name: data.name,
                modelType: data.model_type,
                promptLength: data.prompt.length
            });
            const { data: newModel, error } = await supabase
                .from('user_models')
                .insert([
                {
                    user_id: userId,
                    name: data.name,
                    prompt: data.prompt,
                    model_type: data.model_type,
                    status: 'processing'
                }
            ])
                .select('*')
                .single();
            if (error) {
                console.error('[USER_MODEL_SERVICE] ❌ Error creating user model:', error);
                handleSupabaseError(error, 'creating user model');
            }
            console.log('[USER_MODEL_SERVICE] ✅ User model created:', { modelId: newModel.id });
            return newModel;
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Create user model error:', error);
            return handleSupabaseError(error, 'creating user model');
        }
    },
    async getUserModels(userId) {
        try {
            validateUserId(userId);
            console.log('[USER_MODEL_SERVICE] 📋 Fetching user models for:', userId.substring(0, 8) + '...');
            const { data: models, error } = await supabase
                .from('user_models')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('[USER_MODEL_SERVICE] ❌ Error fetching user models:', error);
                handleSupabaseError(error, 'fetching user models');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Found models:', models?.length || 0);
            return models || [];
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Get user models error:', error);
            return handleSupabaseError(error, 'fetching user models');
        }
    },
    async getUserModelById(userId, modelId) {
        try {
            validateUserId(userId);
            if (!modelId || typeof modelId !== 'string') {
                throw new Error('Invalid model ID');
            }
            console.log('[USER_MODEL_SERVICE] 🔍 Fetching user model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: modelId.substring(0, 8) + '...'
            });
            const { data: model, error } = await supabase
                .from('user_models')
                .select('*')
                .eq('user_id', userId)
                .eq('id', modelId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Model not found');
                }
                console.error('[USER_MODEL_SERVICE] ❌ Error fetching user model:', error);
                handleSupabaseError(error, 'fetching user model');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Model found:', { modelId: model.id });
            return model;
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Get user model error:', error);
            return handleSupabaseError(error, 'fetching user model');
        }
    },
    async updateUserModel(userId, modelId, updates) {
        try {
            validateUserId(userId);
            if (!modelId || typeof modelId !== 'string') {
                throw new Error('Invalid model ID');
            }
            console.log('[USER_MODEL_SERVICE] ✏️ Updating user model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: modelId.substring(0, 8) + '...',
                updates: Object.keys(updates)
            });
            const { data: updatedModel, error } = await supabase
                .from('user_models')
                .update(updates)
                .eq('user_id', userId)
                .eq('id', modelId)
                .select('*')
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Model not found');
                }
                console.error('[USER_MODEL_SERVICE] ❌ Error updating user model:', error);
                handleSupabaseError(error, 'updating user model');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Model updated:', { modelId: updatedModel.id });
            return updatedModel;
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Update user model error:', error);
            return handleSupabaseError(error, 'updating user model');
        }
    },
    async deleteUserModel(userId, modelId) {
        try {
            validateUserId(userId);
            if (!modelId || typeof modelId !== 'string') {
                throw new Error('Invalid model ID');
            }
            console.log('[USER_MODEL_SERVICE] 🗑️ Deleting user model:', {
                userId: userId.substring(0, 8) + '...',
                modelId: modelId.substring(0, 8) + '...'
            });
            const { error } = await supabase
                .from('user_models')
                .delete()
                .eq('user_id', userId)
                .eq('id', modelId);
            if (error) {
                console.error('[USER_MODEL_SERVICE] ❌ Error deleting user model:', error);
                handleSupabaseError(error, 'deleting user model');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Model deleted successfully');
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Delete user model error:', error);
            handleSupabaseError(error, 'deleting user model');
        }
    },
    async updateModelStatus(modelId, status, imageUrl) {
        try {
            if (!modelId || typeof modelId !== 'string') {
                throw new Error('Invalid model ID');
            }
            console.log('[USER_MODEL_SERVICE] 🔄 Updating model status:', {
                modelId: modelId.substring(0, 8) + '...',
                status,
                hasImageUrl: !!imageUrl
            });
            const updates = { status };
            if (imageUrl) {
                updates.image_url = imageUrl;
            }
            const { error } = await supabase
                .from('user_models')
                .update(updates)
                .eq('id', modelId);
            if (error) {
                console.error('[USER_MODEL_SERVICE] ❌ Error updating model status:', error);
                handleSupabaseError(error, 'updating model status');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Model status updated');
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Update model status error:', error);
            handleSupabaseError(error, 'updating model status');
        }
    },
    async findModelByFashionAIRequestId(requestId) {
        try {
            if (!requestId || typeof requestId !== 'string') {
                throw new Error('Invalid Fashion AI request ID');
            }
            console.log('[USER_MODEL_SERVICE] 🔍 Finding model by Fashion AI request ID:', requestId.substring(0, 16) + '...');
            const { data: model, error } = await supabase
                .from('user_models')
                .select('*')
                .eq('fashion_ai_request_id', requestId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('[USER_MODEL_SERVICE] ℹ️ No model found for request ID');
                    return null;
                }
                console.error('[USER_MODEL_SERVICE] ❌ Error finding model by request ID:', error);
                handleSupabaseError(error, 'finding model by request ID');
            }
            console.log('[USER_MODEL_SERVICE] ✅ Model found by request ID:', { modelId: model?.id });
            return model;
        }
        catch (error) {
            console.error('[USER_MODEL_SERVICE] ❌ Find model by request ID error:', error);
            return null;
        }
    }
};
//# sourceMappingURL=userModel.js.map