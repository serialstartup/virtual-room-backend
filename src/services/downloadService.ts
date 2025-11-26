import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export type WorkflowType = 'classic' | 'avatar' | 'text-to-fashion' | 'product-to-model';

export interface DownloadInfo {
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export class DownloadService {
  // Generate filename with timestamp
  static generateFilename(workflowType: WorkflowType): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `VirtualRoom_${workflowType}_${timestamp}.jpg`;
  }

  // Validate image URL
  static isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http') && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png'));
  }

  // Get image info for download
  static async getImageInfo(
    imageUrl: string,
    workflowType: WorkflowType
  ): Promise<DownloadInfo> {
    try {
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      console.log(`📥 [DownloadService] Getting image info:`, {
        imageUrl,
        workflowType
      });

      // For now, we'll return basic info
      // In a production app, you might want to fetch the image to get actual size
      const filename = this.generateFilename(workflowType);
      
      return {
        filename,
        mimeType: 'image/jpeg',
        size: 0, // Could fetch actual size if needed
        url: imageUrl
      };
    } catch (error) {
      console.error('[DownloadService] Error getting image info:', error);
      throw error;
    }
  }

  // Get download URL (proxy through backend if needed)
  static async getDownloadUrl(
    imageUrl: string,
    workflowType: WorkflowType
  ): Promise<string> {
    try {
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      console.log(`🔗 [DownloadService] Getting download URL:`, {
        imageUrl,
        workflowType
      });

      // For now, return the original URL
      // In production, you might want to proxy through your backend for security
      return imageUrl;
    } catch (error) {
      console.error('[DownloadService] Error getting download URL:', error);
      throw error;
    }
  }

  // Log download activity (for analytics)
  static async logDownload(
    userId: string,
    tryOnId: string,
    workflowType: WorkflowType,
    imageUrl: string
  ): Promise<void> {
    try {
      console.log(`📊 [DownloadService] Logging download:`, {
        userId,
        tryOnId,
        workflowType,
        imageUrl,
        timestamp: new Date().toISOString()
      });

      // In a production app, you might want to store download analytics
      // For now, we'll just log it
    } catch (error) {
      console.error('[DownloadService] Error logging download:', error);
      // Don't throw error for logging failures
    }
  }

  // Validate download permissions
  static async canUserDownload(
    userId: string,
    tryOnId: string
  ): Promise<boolean> {
    try {
      // Add permission checks here if needed
      // For example, check if user owns the try-on, has valid subscription, etc.
      
      console.log(`🔐 [DownloadService] Checking download permissions:`, {
        userId,
        tryOnId
      });

      // For now, allow all downloads
      // In production, you might want to implement proper permission checks
      return true;
    } catch (error) {
      console.error('[DownloadService] Error checking download permissions:', error);
      return false;
    }
  }
}