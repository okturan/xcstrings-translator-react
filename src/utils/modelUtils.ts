/**
 * Utilities for working with AI model IDs and provider names
 */

/**
 * Extracts the provider name from a model ID
 * @example extractProviderFromModelId("anthropic/claude-3") => "anthropic"
 */
export const extractProviderFromModelId = (modelId: string): string => {
  return modelId.split('/')[0];
};

/**
 * Capitalizes the first letter of a provider name
 * @example capitalizeProvider("anthropic") => "Anthropic"
 */
export const capitalizeProvider = (provider: string): string => {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

/**
 * Formats a provider name from a model ID
 * @example formatProviderName("anthropic/claude-3") => "Anthropic"
 */
export const formatProviderName = (modelId: string): string => {
  const provider = extractProviderFromModelId(modelId);
  return capitalizeProvider(provider);
};
