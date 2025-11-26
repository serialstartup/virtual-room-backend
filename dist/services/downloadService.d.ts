export type WorkflowType = 'classic' | 'avatar' | 'text-to-fashion' | 'product-to-model';
export interface DownloadInfo {
    filename: string;
    mimeType: string;
    size: number;
    url: string;
}
export declare class DownloadService {
    static generateFilename(workflowType: WorkflowType): string;
    static isValidImageUrl(url: string): boolean;
    static getImageInfo(imageUrl: string, workflowType: WorkflowType): Promise<DownloadInfo>;
    static getDownloadUrl(imageUrl: string, workflowType: WorkflowType): Promise<string>;
    static logDownload(userId: string, tryOnId: string, workflowType: WorkflowType, imageUrl: string): Promise<void>;
    static canUserDownload(userId: string, tryOnId: string): Promise<boolean>;
}
