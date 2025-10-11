import React from "react";
import WordQuiz from "@/components/games/WordQuiz";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/user/DashboardSidebar";

export default async function WordQuizPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            <div className="flex">
                <DashboardSidebar username={user.username} />
                <div className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-neutral-100 mb-4">
                        Word Quiz
                    </h1>
                    <WordQuiz limit={8} />
                </div>
            </div>
        </div>
    );
}
