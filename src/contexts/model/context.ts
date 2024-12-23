import { createContext } from 'react';

export interface ModelContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const ModelContext = createContext<ModelContextType | undefined>(undefined);
