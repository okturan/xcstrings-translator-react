/**
 * Environment configuration for the application
 *
 * This centralizes all environment-dependent configuration,
 * making it easy to switch between environments and mock for testing.
 */

export const ENV = {
  /**
   * OpenRouter API base URL
   * Can be overridden via VITE_OPENROUTER_API_URL environment variable
   */
  OPENROUTER_API_URL: import.meta.env.VITE_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
} as const;

/**
 * API endpoints derived from environment configuration
 */
export const API_ENDPOINTS = {
  CHAT_COMPLETIONS: `${ENV.OPENROUTER_API_URL}/chat/completions`,
  MODELS: `${ENV.OPENROUTER_API_URL}/models`,
} as const;
