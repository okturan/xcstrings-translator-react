import { useState, useEffect, useMemo } from "react";
import { Model, fetchModels } from "../utils/modelService";
import ReactMarkdown from "react-markdown";

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

type GroupedModels = {
  [provider: string]: Model[];
};

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract provider from model ID (e.g., "anthropic/claude-3" -> "anthropic")
  const getProvider = (modelId: string): string => {
    return modelId.split("/")[0];
  };

  // Group models by provider
  const groupedModels = useMemo(() => {
    return models.reduce((acc: GroupedModels, model) => {
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

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="text-sm text-gray-500">Loading models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Filter & Sort
        </label>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "date" | "price")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="date">Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})</option>
            <option value="name">Sort by Name ({sortOrder === "asc" ? "A-Z" : "Z-A"})</option>
            <option value="price">Sort by Price ({sortOrder === "asc" ? "Lowest" : "Highest"})</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-50"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => onModelSelect(e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
        >
          {filteredModels.map((model) => {
            const provider = getProvider(model.id);
            const pricing = (() => {
              if (model.pricing.prompt === "0" && model.pricing.completion === "0" && model.pricing.image === "0") {
                return "Free";
              }
              const parts = [];
              const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
              const completionPrice = parseFloat(model.pricing.completion) * 1000000;
              const imagePrice = parseFloat(model.pricing.image) * 1000; // Per thousand for images
              
              if (promptPrice > 0) parts.push(`Input: $${promptPrice.toFixed(2)}/M`);
              if (completionPrice > 0 && completionPrice !== promptPrice) parts.push(`Output: $${completionPrice.toFixed(2)}/M`);
              if (imagePrice > 0) parts.push(`Image: $${imagePrice.toFixed(2)}/K`);
              
              return parts.join(" | ");
            })();
            return (
              <option key={model.id} value={model.id}>
                {`${provider.toUpperCase()}: ${model.name} (${pricing})`}
              </option>
            );
          })}
        </select>
      </div>

      {selectedModel && (
        <>
          <div className="mt-2 text-sm text-gray-500 prose prose-sm max-w-none">
            <ReactMarkdown>
              {models.find(m => m.id === selectedModel)?.description || ""}
            </ReactMarkdown>
          </div>
          <div className="mt-2 space-y-1">
            {(() => {
              const model = models.find(m => m.id === selectedModel);
              if (!model) return null;
              return (
                <>
                  <div className="text-xs text-gray-600">
                    Context Length: {model.context_length.toLocaleString()} tokens
                  </div>
                  <div className="text-xs text-gray-600">
                    Pricing: {(() => {
                      if (model.pricing.prompt === "0" && model.pricing.completion === "0" && model.pricing.image === "0") {
                        return "Free";
                      }
                      const parts = [];
                      const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
                      const completionPrice = parseFloat(model.pricing.completion) * 1000000;
                      const imagePrice = parseFloat(model.pricing.image) * 1000; // Per thousand for images
                      
                      if (promptPrice > 0) parts.push(`Input: $${promptPrice.toFixed(2)}/M tokens`);
                      if (completionPrice > 0 && completionPrice !== promptPrice) parts.push(`Output: $${completionPrice.toFixed(2)}/M tokens`);
                      if (imagePrice > 0) parts.push(`Image: $${imagePrice.toFixed(2)}/K`);
                      
                      return parts.join(" | ");
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="mt-2 text-xs text-amber-600">
            Note: This app's translation prompt is optimized for Anthropic models, specifically Claude 3.5 Haiku and Sonnet.
          </div>
        </>
      )}
    </div>
  );
}
