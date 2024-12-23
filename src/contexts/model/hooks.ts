import { useContext, useMemo, useState } from 'react';
import { ModelsContext, ModelsContextType } from './context';
import { Model } from '../../utils/modelService';

export function useModels(): ModelsContextType {
  const context = useContext(ModelsContext);
  if (context === undefined) {
    throw new Error('useModels must be used within a ModelsProvider');
  }
  return context;
}

type SortBy = 'name' | 'date' | 'price';
type SortOrder = 'asc' | 'desc';

interface UseModelSelectorResult {
  filteredModels: Model[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  providers: string[];
}

export function useModelSelector(): UseModelSelectorResult {
  const { models, selectedModel } = useModels();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Extract provider from model ID (e.g., "anthropic/claude-3" -> "anthropic")
  const getProvider = (modelId: string): string => {
    return modelId.split("/")[0];
  };

  // Group models by provider
  const groupedModels = useMemo(() => {
    return models.reduce((acc: { [provider: string]: Model[] }, model) => {
      const provider = getProvider(model.id);
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    }, {});
  }, [models]);

  // Get unique providers
  const providers = useMemo(() => {
    return ["all", ...Object.keys(groupedModels)].sort();
  }, [groupedModels]);

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let filtered = models;

    // Filter by provider
    if (selectedProvider !== "all") {
      filtered = filtered.filter(model => getProvider(model.id) === selectedProvider);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(query) || 
        model.description.toLowerCase().includes(query)
      );
    }

    // Always include the selected model if it exists
    const selectedModelData = models.find(m => m.id === selectedModel);
    if (selectedModelData && !filtered.includes(selectedModelData)) {
      filtered.push(selectedModelData);
    }

    // Sort models
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = a.created - b.created;
      } else if (sortBy === "price") {
        // Calculate total price per million tokens
        const getPricePerMillion = (model: Model) => {
          const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
          const completionPrice = parseFloat(model.pricing.completion) * 1000000;
          const imagePrice = parseFloat(model.pricing.image) * 1000 * 1000;
          return promptPrice + completionPrice + imagePrice;
        };
        comparison = getPricePerMillion(a) - getPricePerMillion(b);
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [models, selectedProvider, searchQuery, sortBy, sortOrder, selectedModel]);

  return {
    filteredModels,
    searchQuery,
    setSearchQuery,
    selectedProvider,
    setSelectedProvider,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    providers,
  };
}
