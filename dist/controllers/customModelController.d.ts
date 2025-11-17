import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
export declare class CustomModelController {
    static createModel(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getModels(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getModelById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateModel(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteModel(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getModelStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static retryModel(req: AuthenticatedRequest, res: Response): Promise<void>;
}
