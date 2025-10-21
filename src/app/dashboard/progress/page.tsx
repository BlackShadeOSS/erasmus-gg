import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import DashboardPageWrapper from "@/components/user/DashboardPageWrapper";
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActivityList from "@/components/user/ActivityList";

async function getServerProgress() {
  const user = await getCurrentUser();
  if (!user) return { progress: [] };

  // fetch recent progress rows for the user (use admin client server-side to bypass RLS)
  const { data: progress } = await supabaseAdmin
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("last_attempt_at", { ascending: false })
    .limit(200);

  const rows = progress || [];

  // Resolve friendly titles for games and vocabulary items
  const gameIds = rows
    .filter((r: any) => r.content_type === "game")
    .map((r: any) => r.content_id);
  const vocabIds = rows
    .filter((r: any) => r.content_type === "vocabulary")
    .map((r: any) => r.content_id);

  const gamesMap: Record<string, any> = {};
  if (gameIds.length) {
    const { data: games } = await supabaseAdmin
      .from("games")
      .select("id, title, description, difficulty_level")
      .in("id", gameIds);
    for (const g of games || []) gamesMap[g.id] = g;
  }

  const vocabMap: Record<string, any> = {};
  if (vocabIds.length) {
    const { data: vocabs } = await supabaseAdmin
      .from("vocabulary")
      .select("id, term_en, term_pl")
      .in("id", vocabIds);

    for (const v of vocabs || []) vocabMap[v.id] = v;

    // also fetch user_vocabulary_progress entries to get mastery levels
    const { data: uvp } = await supabaseAdmin
      .from("user_vocabulary_progress")
      .select("vocabulary_id, mastery_level")
      .eq("user_id", user.id)
      .in("vocabulary_id", vocabIds);

    const masteryMap: Record<string, number> = {};
    for (const m of uvp || [])
      masteryMap[m.vocabulary_id] = m.mastery_level ?? 0;

    // attach mastery to vocabMap
    for (const id of Object.keys(vocabMap)) {
      vocabMap[id].mastery_level = masteryMap[id] ?? 0;
    }
  }

  return { progress: rows, gamesMap, vocabMap };
}

export default async function PostepPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { progress, gamesMap, vocabMap } = await getServerProgress();

  // Simple grouping by content_type
  const grouped: Record<string, any[]> = {};
  for (const p of progress) {
    const t = p.content_type || "other";
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(p);
  }

  // Compute vocabulary mastery summary
  const safeVocabMap = vocabMap || {};
  const masteryCounts: number[] = [0, 0, 0, 0, 0, 0];
  for (const k of Object.keys(safeVocabMap)) {
    const lvl = safeVocabMap[k]?.mastery_level ?? 0;
    masteryCounts[Math.max(0, Math.min(5, lvl))]++;
  }
  const totalVocab = Object.keys(safeVocabMap).length;

  return (
    <div className="min-h-screen bg-background relative">
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <DashboardPageWrapper username={user.username}>
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Twój postęp
              </h1>
              <p className="text-muted-foreground mt-2">
                Przeglądaj ostatnie postępy w grach i zadaniach.
              </p>
            </div>

            {Object.keys(grouped).length === 0 && (
              <div className="text-muted-foreground">
                Brak zapisanych postępów
              </div>
            )}

            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-card/80 border border-border rounded">
                  <div className="text-sm text-muted-foreground">
                    Aktywności
                  </div>
                  <div className="text-2xl text-foreground font-semibold">
                    {progress.length}
                  </div>
                </div>
                <div className="p-4 bg-card/80 border border-border rounded">
                  <div className="text-sm text-muted-foreground">Ukończone</div>
                  <div className="text-2xl text-foreground font-semibold">
                    {Math.round(
                      (progress.filter((p) => p.completed).length /
                        Math.max(1, progress.length)) *
                        100
                    )}
                    %
                  </div>
                </div>
                <div className="p-4 bg-card/80 border border-border rounded">
                  <div className="text-sm text-muted-foreground">
                    Średni wynik
                  </div>
                  <div className="text-2xl text-foreground font-semibold">
                    {progress.filter((p) => typeof p.score === "number").length
                      ? Math.round(
                          progress
                            .filter((p) => typeof p.score === "number")
                            .reduce((s: any, p: any) => s + (p.score || 0), 0) /
                            progress.filter((p) => typeof p.score === "number")
                              .length
                        )
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vocabulary mastery summary card */}
                <Card className="bg-card/90 border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Słownictwo — postęp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground">
                          Słówek:{" "}
                          <strong className="text-foreground">
                            {totalVocab}
                          </strong>
                        </div>
                        <div className="text-muted-foreground">
                          Średnie opanowanie:{" "}
                          <strong className="text-foreground">
                            {totalVocab
                              ? Math.round(
                                  (masteryCounts.reduce(
                                    (s, i) => s + i * i,
                                    0
                                  ) /
                                    (totalVocab * 5)) *
                                    100
                                )
                              : 0}
                            %
                          </strong>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {masteryCounts.map((c, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-24 text-sm text-muted-foreground">
                              {i}:
                            </div>
                            <Progress
                              value={totalVocab ? (c / totalVocab) * 100 : 0}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-foreground">
                              {c}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent activity list */}
                <Card className="bg-card/90 border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Ostatnia aktywność
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityList
                      rows={progress}
                      gamesMap={gamesMap || {}}
                      vocabMap={vocabMap || {}}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DashboardPageWrapper>

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
