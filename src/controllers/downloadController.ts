import type { Request, Response } from "express";
import { DownloadService, type WorkflowType } from "../services/downloadService.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { z } from "zod";

const downloadInfoSchema = z.object({
  image_url: z.string().url(),
  try_on_id: z.string().uuid(),
  workflow_type: z.enum(['classic', 'avatar', 'text-to-fashion', 'product-to-model'])
});

const downloadUrlSchema = z.object({
  image_url: z.string().url(),
  workflow_type: z.enum(['classic', 'avatar', 'text-to-fashion', 'product-to-model'])
});

export class DownloadController {
  // Get download information for an image
  static async getDownloadInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[DOWNLOAD_CONTROLLER] 📥 Get download info started - RequestID: ${requestId}`);

    try {
      const { image_url, try_on_id, workflow_type } = downloadInfoSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if user can download this image
      const canDownload = await DownloadService.canUserDownload(userId, try_on_id);
      if (!canDownload) {
        res.status(403).json({ error: 'Download not permitted' });
        return;
      }

      const downloadInfo = await DownloadService.getImageInfo(image_url, workflow_type as WorkflowType);

      console.log(`✅ [DOWNLOAD_CONTROLLER] Download info retrieved - RequestID: ${requestId}`, {
        tryOnId: try_on_id,
        workflowType: workflow_type,
        filename: downloadInfo.filename
      });

      res.status(200).json({
        success: true,
        download_info: downloadInfo
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD_CONTROLLER] Error - RequestID: ${requestId}:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request body', details: error.issues });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get download URL for an image
  static async getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[DOWNLOAD_CONTROLLER] 🔗 Get download URL started - RequestID: ${requestId}`);

    try {
      const { image_url, workflow_type } = downloadUrlSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const downloadUrl = await DownloadService.getDownloadUrl(image_url, workflow_type as WorkflowType);

      console.log(`✅ [DOWNLOAD_CONTROLLER] Download URL retrieved - RequestID: ${requestId}`, {
        workflowType: workflow_type,
        originalUrl: image_url
      });

      res.status(200).json({
        success: true,
        download_url: downloadUrl
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD_CONTROLLER] Error - RequestID: ${requestId}:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request body', details: error.issues });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Log download activity
  static async logDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[DOWNLOAD_CONTROLLER] 📊 Log download started - RequestID: ${requestId}`);

    try {
      const { image_url, try_on_id, workflow_type } = downloadInfoSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if user can download this image
      const canDownload = await DownloadService.canUserDownload(userId, try_on_id);
      if (!canDownload) {
        res.status(403).json({ error: 'Download not permitted' });
        return;
      }

      await DownloadService.logDownload(userId, try_on_id, workflow_type as WorkflowType, image_url);

      console.log(`✅ [DOWNLOAD_CONTROLLER] Download logged - RequestID: ${requestId}`, {
        tryOnId: try_on_id,
        workflowType: workflow_type
      });

      res.status(200).json({
        success: true,
        message: 'Download logged successfully'
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD_CONTROLLER] Error - RequestID: ${requestId}:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request body', details: error.issues });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Check download permissions
  static async checkDownloadPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[DOWNLOAD_CONTROLLER] 🔐 Check download permissions started - RequestID: ${requestId}`);

    try {
      const { try_on_id } = z.object({ try_on_id: z.string().uuid() }).parse(req.query);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const canDownload = await DownloadService.canUserDownload(userId, try_on_id);

      console.log(`✅ [DOWNLOAD_CONTROLLER] Download permissions checked - RequestID: ${requestId}`, {
        tryOnId: try_on_id,
        canDownload
      });

      res.status(200).json({
        success: true,
        can_download: canDownload
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD_CONTROLLER] Error - RequestID: ${requestId}:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request parameters', details: error.issues });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }
}