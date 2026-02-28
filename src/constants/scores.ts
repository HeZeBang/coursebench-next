export interface ScoreLabel {
  label: string;
  color: string;
}

export const scoreInfo: ScoreLabel[] = [
  { label: "数据不足", color: "#B0B0B0" },
  { label: "特别差评", color: "#FF5252" },
  { label: "多半差评", color: "#FF892F" },
  { label: "褒贬不一", color: "#FFC107" },
  { label: "多半好评", color: "#A4BE23" },
  { label: "特别好评", color: "#709800" },
  { label: "好评如潮", color: "#1B5E20" },
  { label: "差评如潮", color: "#B71C1C" },
];

export const gradingInfo = {
  quality: ["很差", "较差", "一般", "较好", "很好"],
  workload: [">8h ", "4-8h", "2-4h", "1-2h", "<1h "],
  difficulty: ["很难", "较难", "适中", "偏易", "简单"],
  distribution: ["很差", "较差", "一般", "较好", "很好"],
  color: ["#FF5252", "#FF892F", "#FFC107", "#A4BE23", "#709800"],
} as const;

export const judgeItems = ["课程质量", "作业用时", "考核难度", "给分情况"] as const;
export type JudgeItem = (typeof judgeItems)[number];

export const gradingEmojis = ["😭", "☹️", "🙁", "🙂", "😊"] as const;

/** Minimum comment count to display a score (otherwise "数据不足") */
export const ENOUGH_DATA_THRESHOLD = 3;

/**
 * Get the score label & color for a given score value.
 * score range: 1 ~ 5 (float), mapped to scoreInfo indices 1-6
 * If commentCount < threshold, returns scoreInfo[0] ("数据不足")
 */
export function getScoreInfo(
  score: number,
  commentCount: number
): ScoreLabel {
  if (commentCount < ENOUGH_DATA_THRESHOLD || score <= 0) return scoreInfo[0];
  const rounded = Math.round(score);
  if (rounded <= 1) return scoreInfo[1];
  if (rounded >= 5) return scoreInfo[6];
  return scoreInfo[rounded];
}
