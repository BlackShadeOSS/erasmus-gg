import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPageWrapper from "@/components/user/DashboardPageWrapper";
import WordMatching from "@/components/word-matching/WordMatching";
import Footer from "@/components/Footer";

export default async function WordMatchingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardPageWrapper username={user.username}>
        <div className="flex-1 p-4 md:p-8" style={{ overflowX: "hidden" }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Word Matching
          </h1>
          <WordMatching limit={8} />
        </div>
      </DashboardPageWrapper>
    </div>
  );
}
