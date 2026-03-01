import type { SelectOption } from "@/types";
import { gradeEnum, termEnum } from "./info";

export const gradeItems: SelectOption<string>[] = Object.entries(gradeEnum)
  .filter(([key]) => isNaN(Number(key)))
  .map(
    ([key, value]) => ({ label: key, value: String(value) }),
);

export const visibleItems: SelectOption[] = [
  { label: "匿名", value: "anonymous" },
  { label: "公开", value: "public" },
];

const startYear = 2014;
const nowYear = new Date().getFullYear();

export const rawYearItems: number[] = Array.from(
  { length: nowYear - startYear + 1 },
  (_, i) => nowYear - i,
);

export const yearItems: SelectOption<number | string>[] = [
  { label: "暂不透露", value: 0 },
  ...rawYearItems.map((y) => ({ label: String(y), value: y })),
];

export const termItems: SelectOption<string>[] = Object.entries(termEnum)
  .filter(([key]) => isNaN(Number(key)))
  .map(
    ([key, value]) => ({ label: key, value: String(value).padStart(2, '0') }),
);
