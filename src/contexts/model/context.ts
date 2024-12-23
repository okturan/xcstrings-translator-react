import { createContext } from 'react';
import { Model } from '../../utils/modelService';

export interface ModelsContextType {
  models: Model[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
  setSelectedModel: (model: string) => void;
}

export const ModelsContext = createContext<ModelsContextType | undefined>(undefined);
