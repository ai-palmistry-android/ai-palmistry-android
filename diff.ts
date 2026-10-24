export interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

/**
 * Computes a clean word-level diff between two text strings using tokenized LCS.
 */
export function computeWordDiff(oldText: string, newText: string): DiffPart[] {
  if (oldText === newText) {
    return [{ type: 'unchanged', text: oldText }];
  }

  // Tokenize preserving spaces and punctuation
  const tokenize = (str: string): string[] => {
    return str.match(/\s+|\w+|[^\w\s]+/g) || [];
  };

  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  const n = oldTokens.length;
  const m = newTokens.length;

  // Build matrix for LCS
  // Optimize for reasonable lengths (cap matrix size to avoid excessive memory on giant docs)
  if (n * m > 250000) {
    // For very large selections, fallback to simple removed/added representation
    return [
      { type: 'removed', text: oldText },
      { type: 'added', text: newText },
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldTokens[i] === newTokens[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to find diff
  const rawParts: DiffPart[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      rawParts.unshift({ type: 'unchanged', text: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawParts.unshift({ type: 'added', text: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawParts.unshift({ type: 'removed', text: oldTokens[i - 1] });
      i--;
    }
  }

  // Consolidate adjacent parts of same type
  const consolidated: DiffPart[] = [];
  for (const part of rawParts) {
    if (consolidated.length > 0 && consolidated[consolidated.length - 1].type === part.type) {
      consolidated[consolidated.length - 1].text += part.text;
    } else {
      consolidated.push({ ...part });
    }
  }

  return consolidated;
}
