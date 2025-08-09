export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9% ]/g, '') // Keep letters, numbers, %, and spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  
  const m = a.length;
  const n = b.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  // Create matrix
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}