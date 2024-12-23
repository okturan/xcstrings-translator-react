import { getStoredApiKey } from "./apiKeyUtils";

interface ModelPricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
}

interface ModelArchitecture {
  tokenizer: string;
  instruct_type: string;
  modality: string;
}

interface ModelProvider {
  context_length: number;
  max_completion_tokens: number;
  is_moderated: boolean;
}

export interface Model {
  id: string;
  name: string;
  created: number;
  description: string;
  pricing: ModelPricing;
  context_length: number;
  architecture: ModelArchitecture;
  top_provider: ModelProvider;
}

export const fetchModels = async (): Promise<Model[]> => {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${getStoredApiKey()}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to fetch models");
  }

  const data = await response.json();
  return data.data;
};
