import { supabase, handleSupabaseError, validateUserId } from './supabase.js';
export const avatarService = {
    async createAvatar(userId, data) {
        try {
            validateUserId(userId);
            console.log('[AVATAR_SERVICE] 👤 Creating avatar:', {
                userId: userId.substring(0, 8) + '...',
                name: data.name,
                faceImageUrl: data.face_image_url.substring(0, 50) + '...'
            });
            const { data: newAvatar, error } = await supabase
                .from('user_avatars')
                .insert([
                {
                    user_id: userId,
                    name: data.name,
                    face_image_url: data.face_image_url,
                    status: 'processing'
                }
            ])
                .select('*')
                .single();
            if (error) {
                console.error('[AVATAR_SERVICE] ❌ Error creating avatar:', error);
                handleSupabaseError(error, 'creating avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar created:', { avatarId: newAvatar.id });
            return newAvatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Create avatar error:', error);
            return handleSupabaseError(error, 'creating avatar');
        }
    },
    async getUserAvatars(userId) {
        try {
            validateUserId(userId);
            console.log('[AVATAR_SERVICE] 📋 Fetching avatars for:', userId.substring(0, 8) + '...');
            const { data: avatars, error } = await supabase
                .from('user_avatars')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('[AVATAR_SERVICE] ❌ Error fetching avatars:', error);
                handleSupabaseError(error, 'fetching avatars');
            }
            console.log('[AVATAR_SERVICE] ✅ Found avatars:', avatars?.length || 0);
            return avatars || [];
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Get avatars error:', error);
            return handleSupabaseError(error, 'fetching avatars');
        }
    },
    async getAvatarById(userId, avatarId) {
        try {
            validateUserId(userId);
            if (!avatarId || typeof avatarId !== 'string') {
                throw new Error('Invalid avatar ID');
            }
            console.log('[AVATAR_SERVICE] 🔍 Fetching avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: avatarId.substring(0, 8) + '...'
            });
            const { data: avatar, error } = await supabase
                .from('user_avatars')
                .select('*')
                .eq('user_id', userId)
                .eq('id', avatarId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Avatar not found');
                }
                console.error('[AVATAR_SERVICE] ❌ Error fetching avatar:', error);
                handleSupabaseError(error, 'fetching avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar found:', { avatarId: avatar.id });
            return avatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Get avatar error:', error);
            return handleSupabaseError(error, 'fetching avatar');
        }
    },
    async updateAvatar(userId, avatarId, updates) {
        try {
            validateUserId(userId);
            if (!avatarId || typeof avatarId !== 'string') {
                throw new Error('Invalid avatar ID');
            }
            console.log('[AVATAR_SERVICE] ✏️ Updating avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: avatarId.substring(0, 8) + '...',
                updates: Object.keys(updates)
            });
            const { data: updatedAvatar, error } = await supabase
                .from('user_avatars')
                .update(updates)
                .eq('user_id', userId)
                .eq('id', avatarId)
                .select('*')
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Avatar not found');
                }
                console.error('[AVATAR_SERVICE] ❌ Error updating avatar:', error);
                handleSupabaseError(error, 'updating avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar updated:', { avatarId: updatedAvatar.id });
            return updatedAvatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Update avatar error:', error);
            return handleSupabaseError(error, 'updating avatar');
        }
    },
    async deleteAvatar(userId, avatarId) {
        try {
            validateUserId(userId);
            if (!avatarId || typeof avatarId !== 'string') {
                throw new Error('Invalid avatar ID');
            }
            console.log('[AVATAR_SERVICE] 🗑️ Deleting avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: avatarId.substring(0, 8) + '...'
            });
            // Check if this is the primary avatar
            const { data: avatar } = await supabase
                .from('user_avatars')
                .select('is_primary')
                .eq('user_id', userId)
                .eq('id', avatarId)
                .single();
            if (avatar?.is_primary) {
                throw new Error('Cannot delete primary avatar. Please set another avatar as primary first.');
            }
            const { error } = await supabase
                .from('user_avatars')
                .delete()
                .eq('user_id', userId)
                .eq('id', avatarId);
            if (error) {
                console.error('[AVATAR_SERVICE] ❌ Error deleting avatar:', error);
                handleSupabaseError(error, 'deleting avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar deleted successfully');
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Delete avatar error:', error);
            handleSupabaseError(error, 'deleting avatar');
        }
    },
    async updateAvatarStatus(avatarId, status, avatarImageUrl) {
        try {
            if (!avatarId || typeof avatarId !== 'string') {
                throw new Error('Invalid avatar ID');
            }
            console.log('[AVATAR_SERVICE] 🔄 Updating avatar status:', {
                avatarId: avatarId.substring(0, 8) + '...',
                status,
                hasImageUrl: !!avatarImageUrl
            });
            const updates = { status };
            if (avatarImageUrl) {
                updates.avatar_image_url = avatarImageUrl;
            }
            const { error } = await supabase
                .from('user_avatars')
                .update(updates)
                .eq('id', avatarId);
            if (error) {
                console.error('[AVATAR_SERVICE] ❌ Error updating avatar status:', error);
                handleSupabaseError(error, 'updating avatar status');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar status updated');
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Update avatar status error:', error);
            handleSupabaseError(error, 'updating avatar status');
        }
    },
    async getPrimaryAvatar(userId) {
        try {
            validateUserId(userId);
            console.log('[AVATAR_SERVICE] 🎯 Fetching primary avatar for:', userId.substring(0, 8) + '...');
            const { data: avatar, error } = await supabase
                .from('user_avatars')
                .select('*')
                .eq('user_id', userId)
                .eq('is_primary', true)
                .eq('status', 'completed')
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('[AVATAR_SERVICE] ℹ️ No primary avatar found');
                    return null;
                }
                console.error('[AVATAR_SERVICE] ❌ Error fetching primary avatar:', error);
                handleSupabaseError(error, 'fetching primary avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Primary avatar found:', { avatarId: avatar?.id });
            return avatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Get primary avatar error:', error);
            return null;
        }
    },
    async setPrimaryAvatar(userId, avatarId) {
        try {
            validateUserId(userId);
            if (!avatarId || typeof avatarId !== 'string') {
                throw new Error('Invalid avatar ID');
            }
            console.log('[AVATAR_SERVICE] 🎯 Setting primary avatar:', {
                userId: userId.substring(0, 8) + '...',
                avatarId: avatarId.substring(0, 8) + '...'
            });
            // First verify the avatar exists and belongs to the user
            const avatar = await this.getAvatarById(userId, avatarId);
            if (avatar.status !== 'completed') {
                throw new Error('Cannot set incomplete avatar as primary');
            }
            // Update the avatar to be primary (trigger will handle setting others to non-primary)
            const { data: updatedAvatar, error } = await supabase
                .from('user_avatars')
                .update({ is_primary: true })
                .eq('user_id', userId)
                .eq('id', avatarId)
                .select('*')
                .single();
            if (error) {
                console.error('[AVATAR_SERVICE] ❌ Error setting primary avatar:', error);
                handleSupabaseError(error, 'setting primary avatar');
            }
            console.log('[AVATAR_SERVICE] ✅ Primary avatar set:', { avatarId: updatedAvatar.id });
            return updatedAvatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Set primary avatar error:', error);
            return handleSupabaseError(error, 'setting primary avatar');
        }
    },
    async findAvatarByFashionAIRequestId(requestId) {
        try {
            if (!requestId || typeof requestId !== 'string') {
                throw new Error('Invalid Fashion AI request ID');
            }
            console.log('[AVATAR_SERVICE] 🔍 Finding avatar by Fashion AI request ID:', requestId.substring(0, 16) + '...');
            const { data: avatar, error } = await supabase
                .from('user_avatars')
                .select('*')
                .eq('fashion_ai_request_id', requestId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('[AVATAR_SERVICE] ℹ️ No avatar found for request ID');
                    return null;
                }
                console.error('[AVATAR_SERVICE] ❌ Error finding avatar by request ID:', error);
                handleSupabaseError(error, 'finding avatar by request ID');
            }
            console.log('[AVATAR_SERVICE] ✅ Avatar found by request ID:', { avatarId: avatar?.id });
            return avatar;
        }
        catch (error) {
            console.error('[AVATAR_SERVICE] ❌ Find avatar by request ID error:', error);
            return null;
        }
    }
};
//# sourceMappingURL=avatarService.js.map