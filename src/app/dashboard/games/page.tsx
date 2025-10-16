import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPageWrapper from "@/components/user/DashboardPageWrapper";

const games = [
  {
    id: "pamiec",
    title: "Memory",
    description:
      "Sprawdź swoją pamięć i zdolności językowe! Dopasuj słówka angielskie do polskich.",
    icon: "🧠",
    path: "/pamiec",
    difficulty: "Średnia",
  },
  {
    id: "word-quiz",
    title: "Word Quiz",
    description: "Wybierz poprawne tłumaczenie lub opis słówka.",
    icon: "✍️",
    path: "/word-quiz",
    difficulty: "Łatwa",
  },
  {
    id: "word-matching",
    title: "Word Matching",
    description: "Dopasuj słówka przeciągając je we właściwe miejsce.",
    icon: "📑",
    path: "/word-matching",
    difficulty: "Łatwa",
  },
  {
    id: "vocaba",
    title: "Vocaba",
    description: "Utwórz zdania na podstawie podanych wyrazów.",
    icon: "📚",
    path: "/vocaba",
    difficulty: "Mieszana",
  },
  // Możesz dodać więcej gier tutaj w przyszłości
];

export default async function GamesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <DashboardPageWrapper username={user.username}>
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">
                Gry Edukacyjne i Ćwiczenia
              </h1>
              <p className="text-neutral-400 mt-2">
                Ucz się angielskiego przez zabawę!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80 hover:border-amber-600/50 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{game.icon}</span>
                      <div>
                        <CardTitle className="text-neutral-100">
                          {game.title}
                        </CardTitle>
                        <CardDescription className="text-neutral-400 text-xs">
                          Trudność: {game.difficulty}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-neutral-300 text-sm">
                      {game.description}
                    </p>
                    <Link href={game.path}>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                        Zagraj Teraz
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {games.length === 1 && (
              <div className="text-center text-neutral-500 mt-8">
                <p>Więcej gier wkrótce! 🎮</p>
              </div>
            )}
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
