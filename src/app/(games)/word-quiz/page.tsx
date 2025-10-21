import React from "react";
import WordQuiz from "@/components/games/WordQuiz";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPageWrapper from "@/components/user/DashboardPageWrapper";

export default async function WordQuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardPageWrapper username={user.username}>
        <div className="flex-1 p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Word Quiz
          </h1>
          <WordQuiz limit={8} />
        </div>
      </DashboardPageWrapper>
    </div>
  );
}
