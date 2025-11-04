/**
 * Utilities for formatting AI model pricing information
 */

import { PRICING_MULTIPLIERS } from "../constants";

export interface ModelPricing {
  prompt: string;
  completion: string;
  image: string;
}

/**
 * Formats model pricing for display
 * @param pricing - The model pricing object
 * @param detailed - Whether to include detailed labels (e.g., "tokens")
 * @returns Formatted pricing string
 */
export const formatModelPricing = (pricing: ModelPricing, detailed = false): string => {
  if (pricing.prompt === "0" && pricing.completion === "0" && pricing.image === "0") {
    return "Free";
  }

  const parts: string[] = [];
  const promptPrice = parseFloat(pricing.prompt) * PRICING_MULTIPLIERS.TOKENS_PER_MILLION;
  const completionPrice = parseFloat(pricing.completion) * PRICING_MULTIPLIERS.TOKENS_PER_MILLION;
  const imagePrice = parseFloat(pricing.image) * PRICING_MULTIPLIERS.IMAGES_PER_THOUSAND;

  if (promptPrice > 0) {
    const suffix = detailed ? ' tokens' : '';
    parts.push(`Input: $${promptPrice.toFixed(2)}/M${suffix}`);
  }

  if (completionPrice > 0 && completionPrice !== promptPrice) {
    const suffix = detailed ? ' tokens' : '';
    parts.push(`Output: $${completionPrice.toFixed(2)}/M${suffix}`);
  }

  if (imagePrice > 0) {
    parts.push(`Image: $${imagePrice.toFixed(2)}/K`);
  }

  return parts.join(" | ");
};
