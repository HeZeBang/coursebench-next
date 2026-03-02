import { ENOUGH_DATA_THRESHOLD } from "@/constants";
import type { Comment } from "@/types";

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

/**
 * Calculate star distribution from comments.
 * Returns an array [1★ count, 2★ count, 3★ count, 4★ count, 5★ count].
 * Each comment's star rating is the rounded average of its 4-dimension scores.
 */
export function calculateStarDistribution(comments: Comment[]): number[] {
  const distribution = [0, 0, 0, 0, 0]; // [1★, 2★, 3★, 4★, 5★]

  for (const comment of comments) {
    if (!comment.score || comment.score.length < 4) continue;
    const avg = averageScore(comment.score);
    const starRating = Math.round(avg); // 1-5
    if (starRating >= 1 && starRating <= 5) {
      distribution[starRating - 1]++;
    }
  }

  return distribution;
}

/**
 * Convert star distribution counts to percentages.
 * Returns an array [1★ %, 2★ %, 3★ %, 4★ %, 5★ %].
 */
export function starDistributionToPercentages(
  distribution: number[],
): number[] {
  const total = distribution.reduce((sum, count) => sum + count, 0);
  if (total === 0) return [0, 0, 0, 0, 0];
  return distribution.map((count) => (count / total) * 100);
}
