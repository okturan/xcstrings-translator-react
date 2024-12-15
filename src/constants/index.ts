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
  key: "text-gray-900",
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

export const API_ENDPOINTS = {
  strings: "/Localizable.xcstrings",
} as const;

export const ERROR_MESSAGES = {
  httpError: (status: number) => `HTTP error! status: ${status}`,
  invalidData: "Invalid data structure in Localizable.xcstrings",
  genericError: "An error occurred while loading the strings file",
} as const;
