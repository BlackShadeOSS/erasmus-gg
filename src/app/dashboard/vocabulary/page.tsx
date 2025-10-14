// filepath: /home/laitdsgn/Downloads/erasmus-gg/src/app/dashboard/vocabulary/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import VocabularyTable from "@/components/user/VocabularyTable";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default async function VocabularyPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    // Fetch vocabulary progress summary for current user
    let progressSummary = null;
    try {
        const res = await fetch(
            `${
                process.env.NEXT_PUBLIC_APP_URL || ""
            }/api/user/vocabulary/progress`,
            { cache: "no-store" }
        );
        if (res.ok) progressSummary = await res.json();
    } catch (e) {
        // ignore
    }

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            <div>
                <GlowingCircle />
                <GlowingCircle isRight={true} />
            </div>

            <div className="flex">
                <DashboardSidebar username={user.username} />

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-6">
                            📚 Słownictwo
                        </h1>
                        {progressSummary?.success && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                                {progressSummary.progress?.counts?.map(
                                    (c: number, i: number) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-neutral-800/80 border border-neutral-700 rounded"
                                        >
                                            <div className="text-neutral-300 text-sm">
                                                Poziom {i}
                                            </div>
                                            <div className="text-neutral-100 font-semibold text-lg">
                                                {c}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <VocabularyTable />
                    </div>
                </div>
            </div>

            <div className="-z-10">
                <DotPattern
                    glow={false}
                    className={cn(
                        "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-20"
                    )}
                />
            </div>

            <NoiseFilter className="-z-10" />
        </div>
    );
}
