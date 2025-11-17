import { Request, Response } from "express";

export interface ModelData {
  id: number;
  name: string;
  image_url: string;
  gender: "female" | "male" | "unisex";
  description?: string;
}

const SUPABASE_URL = "https://dgwlqafeemwdzrbbfpii.supabase.co";
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/models`;

const models: ModelData[] = [
  {
    id: 1,
    name: "Sarah",
    image_url: `${STORAGE_URL}/model1.jpg`,
    gender: "female",
    description: "Professional female model",
  },
  {
    id: 2,
    name: "Emily",
    image_url: `${STORAGE_URL}/model2.jpg`,
    gender: "female",
    description: "Casual female model",
  },
  {
    id: 3,
    name: "Alexandra",
    image_url: `${STORAGE_URL}/model3.jpg`,
    gender: "female",
    description: "Elegant female model",
  },
  {
    id: 4,
    name: "Becky",
    image_url: `${STORAGE_URL}/model4.jpg`,
    gender: "female",
    description: "Young female model",
  },
  {
    id: 5,
    name: "Seth",
    image_url: `${STORAGE_URL}/model5.jpg`,
    gender: "male",
    description: "Professional male model",
  },
  {
    id: 6,
    name: "Johnny",
    image_url: `${STORAGE_URL}/model6.jpg`,
    gender: "male",
    description: "Casual male model",
  },
  {
    id: 7,
    name: "Mary",
    image_url: `${STORAGE_URL}/model7.jpg`,
    gender: "female",
    description: "Young lovely female model",
  },
];

export const getModels = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: models,
      message: "Models retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch models",
    });
  }
};

export const getModelById = async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.id);
    const model = models.find((m) => m.id === modelId);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: "Model not found",
      });
    }

    res.json({
      success: true,
      data: model,
      message: "Model retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching model:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch model",
    });
  }
};
