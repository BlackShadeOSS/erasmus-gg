import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import WordMatching from "@/components/word-matching/WordMatching";
import Footer from "@/components/Footer";

export default async function WordMatchingPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            <div className="flex">
                <DashboardSidebar username={user.username} />
                <div className="flex-1 p-8" style={{ overflowX: "hidden" }}>
                    <h1 className="text-2xl font-bold text-neutral-100 mb-4">Word Matching</h1>
                    {<WordMatching limit={8} />}
                </div>
            </div>
            <Footer />
        </div>
    );
}
