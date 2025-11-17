import fs from 'fs/promises';
import path from 'path';
export class ImageUtils {
    /**
     * Check if a string is a local file path (starts with file://)
     */
    static isLocalFilePath(url) {
        return url.startsWith('file://');
    }
    /**
     * Convert local file path to base64 data URL
     */
    static async convertLocalFileToBase64(filePath) {
        try {
            // Remove file:// prefix if present
            const cleanPath = filePath.replace('file://', '');
            console.log('[IMAGE_UTILS] 📂 Converting local file to base64:', cleanPath);
            // Check if file exists
            await fs.access(cleanPath);
            // Read file as buffer
            const fileBuffer = await fs.readFile(cleanPath);
            // Get file extension to determine MIME type
            const ext = path.extname(cleanPath).toLowerCase();
            let mimeType = 'image/jpeg'; // default
            switch (ext) {
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.webp':
                    mimeType = 'image/webp';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
            }
            // Convert to base64 data URL
            const base64String = fileBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64String}`;
            console.log('[IMAGE_UTILS] ✅ Successfully converted to base64, size:', Math.round(base64String.length / 1024), 'KB');
            return dataUrl;
        }
        catch (error) {
            console.error('[IMAGE_UTILS] ❌ Failed to convert local file to base64:', {
                filePath,
                error: error.message
            });
            throw new Error(`Failed to convert local file to base64: ${error.message}`);
        }
    }
    /**
     * Prepare image URL for Fashion AI API
     * Converts local file paths to base64, leaves remote URLs unchanged
     */
    static async prepareImageForAPI(imageUrl) {
        if (this.isLocalFilePath(imageUrl)) {
            return await this.convertLocalFileToBase64(imageUrl);
        }
        // If it's already a remote URL or base64, return as-is
        return imageUrl;
    }
}
//# sourceMappingURL=imageUtils.js.map