export declare class ImageUtils {
    /**
     * Check if a string is a local file path (starts with file://)
     */
    static isLocalFilePath(url: string): boolean;
    /**
     * Convert local file path to base64 data URL
     */
    static convertLocalFileToBase64(filePath: string): Promise<string>;
    /**
     * Prepare image URL for Fashion AI API
     * Converts local file paths to base64, leaves remote URLs unchanged
     */
    static prepareImageForAPI(imageUrl: string): Promise<string>;
}
