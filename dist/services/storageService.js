import { supabase } from "./supabase.js";
export class StorageService {
    static BUCKET_NAME = "generated-images";
    // Folder types for different AI workflow outputs
    static FOLDERS = {
        AVATARS: "avatars",
        PERSONS: "persons",
        MODELS: "models",
        CLOTHES: "clothes",
        TRY_ONS: "try-ons"
    };
    /**
     * Downloads an image from a URL and uploads it to Supabase Storage.
     * Returns the public URL of the uploaded file.
     * If upload fails, returns null (caller should fallback to original URL).
     */
    static async uploadFromUrl(imageUrl, folder = StorageService.FOLDERS.TRY_ONS, filename) {
        try {
            console.log(`[StorageService] 📥 Downloading image from: ${imageUrl.substring(0, 50)}...`);
            // 1. Download image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            // 2. Generate filename if not provided
            if (!filename) {
                const timestamp = new Date().getTime();
                const random = Math.random().toString(36).substring(2, 8);
                filename = `${timestamp}-${random}.jpg`;
            }
            const filePath = `${folder}/${filename}`;
            console.log(`[StorageService] 📤 Uploading to Supabase: ${this.BUCKET_NAME}/${filePath}`);
            // 3. Upload to Supabase
            const { error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .upload(filePath, buffer, {
                contentType: "image/jpeg",
                upsert: true,
            });
            if (error) {
                console.error("[StorageService] ❌ Upload failed:", error);
                return null;
            }
            // 4. Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(filePath);
            console.log(`[StorageService] ✅ Upload successful: ${publicUrlData.publicUrl}`);
            return publicUrlData.publicUrl;
        }
        catch (error) {
            console.error("[StorageService] 🚨 Error in uploadFromUrl:", error);
            return null;
        }
    }
}
//# sourceMappingURL=storageService.js.map