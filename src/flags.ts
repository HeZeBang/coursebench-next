import { flag } from "@vercel/flags/next";

export interface FeatureMeta {
  key: string;
  name: string;
  description: string;
}

// All feature metadata (displayed on the Lab page)
export const featureMeta: FeatureMeta[] = [
  {
    key: "example-feature",
    name: "示例功能",
    description: "这是一个示例实验功能，用于演示灰度发布系统",
  },
];

export const exampleFeatureFlag = flag<boolean>({
  key: "example-feature",
  defaultValue: false,
  decide: async () => false, // Adjust percentage via stickyPercentage later
});

export const allFlags = {
  "example-feature": exampleFeatureFlag,
} as const;
