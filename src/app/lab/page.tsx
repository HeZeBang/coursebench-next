import { getUserId } from "@/server/auth/session";
import { featureMeta } from "@/flags";
import { exampleFeatureFlag } from "@/flags";
import LabClient from "./LabClient";

export const metadata = {
  title: "实验室 - CourseBench",
  description: "CourseBench 实验功能",
};

export default async function LabPage() {
  const userId = (await getUserId()) ?? 0;

  // Evaluate each flag for the current user
  const flagValues: Record<string, boolean> = {};
  flagValues["example-feature"] = await exampleFeatureFlag();

  return <LabClient featureMeta={featureMeta} flagValues={flagValues} userId={userId} />;
}
