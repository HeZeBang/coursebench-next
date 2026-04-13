/**
 * Sticky percentage hash: deterministic per userId + flagKey
 * so the same user always sees the same result for a given flag.
 */
export function stickyPercentage(userId: number, flagKey: string): number {
  const str = `${userId}:${flagKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Returns true if the user falls within the given percentage threshold.
 * E.g., isEnabled(userId, "my-flag", 25) → true for ~25% of users.
 */
export function isEnabledForUser(
  userId: number,
  flagKey: string,
  percentage: number,
): boolean {
  if (percentage <= 0) return false;
  if (percentage >= 100) return true;
  return stickyPercentage(userId, flagKey) < percentage;
}
