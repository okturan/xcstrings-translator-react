import { ReactNode } from 'react';
import { ModelContext } from './model/context';

interface ModelProviderProps {
  children: ReactNode;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export function ModelProvider({ children, selectedModel, setSelectedModel }: ModelProviderProps) {
  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}
