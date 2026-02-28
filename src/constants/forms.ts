import type { SelectOption } from "@/types";

export const gradeItems: SelectOption<number>[] = [
  { label: "暂不透露", value: 0 },
  { label: "本科生", value: 1 },
  { label: "硕士研究生", value: 2 },
  { label: "博士研究生", value: 3 },
];

export const visibleItems: SelectOption[] = [
  { label: "匿名", value: "anonymous" },
  { label: "公开", value: "public" },
];

const startYear = 2014;
const nowYear = new Date().getFullYear();

export const rawYearItems: number[] = Array.from(
  { length: nowYear - startYear + 1 },
  (_, i) => nowYear - i
);

export const yearItems: SelectOption<number | string>[] = [
  { label: "暂不透露", value: 0 },
  ...rawYearItems.map((y) => ({ label: String(y), value: y })),
];

export const termItems: SelectOption<string>[] = [
  { label: "秋学期", value: "01" },
  { label: "春学期", value: "02" },
  { label: "暑学期", value: "03" },
];
