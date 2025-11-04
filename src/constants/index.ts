export const TABLE_COLUMN_WIDTHS = {
  key: "w-2/12",
  sourceDefault: "w-6/12",
  sourceWithTarget: "w-3/12",
  target: "w-3/12",
  status: "w-1/12",
  extractionState: "w-1/12",
  comment: "w-2/12",
} as const;

export const CELL_STYLES = {
  base: "px-2 py-1 whitespace-normal break-words",
  header: "font-medium text-gray-500 uppercase tracking-wider text-left",
  content: "text-gray-500",
  key: "text-gray-600",
} as const;

export const STATUS_STYLES = {
  translated: {
    bg: "bg-green-100",
    text: "text-green-800",
  },
  missing: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  stale: {
    bg: "bg-orange-100",
    text: "text-orange-400",
  },
  manual: {
    bg: "bg-gray-100",
    text: "text-gray-800",
  },
  "don't translate": {
    bg: "bg-slate-200",
    text: "text-slate-700",
  },
} as const;

export const BADGE_BASE_STYLES = "inline-flex items-center px-2 py-0.5 m-1 rounded-full text-[10px] font-medium";

export const ERROR_MESSAGES = {
  invalidData: "Invalid data structure in Localizable.xcstrings",
  genericError: "An error occurred while processing the file",
  importFailed: "Failed to import the file",
  exportFailed: "Failed to export translations",
  noFileLoaded: "No file is currently loaded",
} as const;

export const TEXTAREA_CONFIG = {
  LINE_HEIGHT: 20,
  PADDING_HEIGHT: 8,
  CHARS_PER_LINE: 60,
} as const;

export const EXPORT_FORMAT = {
  JSON_INDENT: 2,
  KEY_VALUE_SPACING_REGEX: /"([^"]+)":/g,
  KEY_VALUE_SPACING_REPLACEMENT: '"$1" :',
} as const;

export const PRICING_MULTIPLIERS = {
  TOKENS_PER_MILLION: 1000000,
  IMAGES_PER_THOUSAND: 1000,
} as const;

export const TOAST_CONFIG = {
  position: "top-right" as const,
  autoClose: 5000,
  hideProgressBar: false,
} as const;
