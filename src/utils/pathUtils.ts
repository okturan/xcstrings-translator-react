/**
 * Utilities for parsing and manipulating variation paths
 */

export interface ParsedPathPart {
  variationType: string;
  variationKey: string;
}

/**
 * Parses a single path part in the format "type:key"
 * @example parsePathPart("plural:one") => { variationType: "plural", variationKey: "one" }
 */
export const parsePathPart = (part: string): ParsedPathPart => {
  const [variationType, variationKey] = part.split(":");
  return { variationType, variationKey };
};

/**
 * Parses a full path string into an array of parsed path parts
 * @example parsePath("plural:one.device:iphone") => [{ variationType: "plural", variationKey: "one" }, ...]
 */
export const parsePath = (path: string): ParsedPathPart[] => {
  return path.split(".").map(parsePathPart);
};
