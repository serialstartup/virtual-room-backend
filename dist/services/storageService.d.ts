export declare class StorageService {
    private static readonly BUCKET_NAME;
    static readonly FOLDERS: {
        readonly AVATARS: "avatars";
        readonly PERSONS: "persons";
        readonly MODELS: "models";
        readonly CLOTHES: "clothes";
        readonly TRY_ONS: "try-ons";
    };
    /**
     * Downloads an image from a URL and uploads it to Supabase Storage.
     * Returns the public URL of the uploaded file.
     * If upload fails, returns null (caller should fallback to original URL).
     */
    static uploadFromUrl(imageUrl: string, folder?: string, filename?: string): Promise<string | null>;
}
