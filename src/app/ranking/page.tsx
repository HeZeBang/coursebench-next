import type { Metadata } from "next";
import { connection } from "next/server";
import { getRanklist } from "@/server/db/queries";
import RankingClient from "./RankingClient";

export const metadata: Metadata = {
  title: "赏金排名 - CourseBench",
};

export default async function RankingPage() {
  await connection();
  const list = await getRanklist();
  return <RankingClient initialList={list} />;
}
