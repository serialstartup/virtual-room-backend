import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class DownloadController {
    static getDownloadInfo(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    static logDownload(req: AuthenticatedRequest, res: Response): Promise<void>;
    static checkDownloadPermissions(req: AuthenticatedRequest, res: Response): Promise<void>;
}
