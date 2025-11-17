import { Request, Response } from "express";
export interface ModelData {
    id: number;
    name: string;
    image_url: string;
    gender: "female" | "male" | "unisex";
    description?: string;
}
export declare const getModels: (req: Request, res: Response) => Promise<void>;
export declare const getModelById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
