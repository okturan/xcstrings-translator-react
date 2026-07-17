interface PlaceholderToken {
  canonical: string;
  raw: string;
}

export interface PlaceholderMismatch {
  missing: string[];
  unexpected: string[];
}

const NAMED_SUBSTITUTION = /^%#@([^@\s]+)@/;
const FORMAT_PLACEHOLDER = /^%(?:(\d+)\$)?([-+ #0']*(?:\*|\d+)?(?:\.(?:\*|\d+))?(?:hh|h|ll|l|q|L|z|j|t)?[@dDiuUoOxXfFeEgGaAcCsSpn])/;

function extractPlaceholderTokens(value: string): PlaceholderToken[] {
  const tokens: PlaceholderToken[] = [];
  let sequentialArgument = 1;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "%") continue;

    const remainder = value.slice(index);
    if (remainder.startsWith("%%")) {
      index += 1;
      continue;
    }

    const substitution = remainder.match(NAMED_SUBSTITUTION);
    if (substitution) {
      tokens.push({
        canonical: `#@${substitution[1]}@`,
        raw: substitution[0],
      });
      index += substitution[0].length - 1;
      continue;
    }

    const placeholder = remainder.match(FORMAT_PLACEHOLDER);
    if (!placeholder) continue;

    const argument = placeholder[1] ?? String(sequentialArgument);
    tokens.push({
      canonical: `${argument}$${placeholder[2]}`,
      raw: placeholder[0],
    });
    sequentialArgument += 1;
    index += placeholder[0].length - 1;
  }

  return tokens;
}

function subtractTokens(expected: PlaceholderToken[], actual: PlaceholderToken[]): string[] {
  const remaining = new Map<string, number>();
  for (const token of actual) {
    remaining.set(token.canonical, (remaining.get(token.canonical) ?? 0) + 1);
  }

  const difference: string[] = [];
  for (const token of expected) {
    const count = remaining.get(token.canonical) ?? 0;
    if (count === 0) difference.push(token.raw);
    else remaining.set(token.canonical, count - 1);
  }
  return difference;
}

export function placeholderMismatch(expectedValue: string, nextValue: string): PlaceholderMismatch | null {
  const expected = extractPlaceholderTokens(expectedValue);
  const next = extractPlaceholderTokens(nextValue);
  const missing = subtractTokens(expected, next);
  const unexpected = subtractTokens(next, expected);

  return missing.length || unexpected.length ? { missing, unexpected } : null;
}

export function assertPlaceholderParity(expectedValue: string, nextValue: string): void {
  const mismatch = placeholderMismatch(expectedValue, nextValue);
  if (!mismatch) return;

  const details = [
    mismatch.missing.length ? `missing ${mismatch.missing.join(", ")}` : null,
    mismatch.unexpected.length ? `unexpected ${mismatch.unexpected.join(", ")}` : null,
  ].filter(Boolean);
  throw new Error(`Placeholder mismatch: ${details.join("; ")}.`);
}
