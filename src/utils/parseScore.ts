import { ENOUGH_DATA_THRESHOLD } from "@/constants";

/**
 * Compute the overall average from a score array (4 dimensions).
 * Returns 0 for empty/null arrays.
 */
export function averageScore(score: number[] | null | undefined): number {
  if (!score || score.length === 0) return 0;
  return score.reduce((a, b) => a + b, 0) / score.length;
}

/**
 * Round score to 1 decimal place.
 * Returns 0 if not enough data.
 */
export function parseScore(score: number, commentCount: number): number {
  if (commentCount < ENOUGH_DATA_THRESHOLD || score <= 0) return 0;
  return Math.round(score * 10) / 10;
}
