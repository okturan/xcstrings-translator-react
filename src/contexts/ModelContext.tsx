import { ReactNode, useEffect, useState } from 'react';
import { ModelsContext } from './model/context';
import { Model, fetchModels } from '../utils/modelService';

interface ModelsProviderProps {
  children: ReactNode;
}

export function ModelsProvider({ children }: ModelsProviderProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-3.5-haiku-20241022:beta");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const fetchedModels = await fetchModels();
        setModels(fetchedModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load models");
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  return (
    <ModelsContext.Provider 
      value={{ 
        models, 
        selectedModel, 
        setSelectedModel,
        isLoading,
        error
      }}
    >
      {children}
    </ModelsContext.Provider>
  );
}
