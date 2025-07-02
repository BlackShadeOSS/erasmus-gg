import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import { HomeContent } from "@/data/HomeContent";
import Footer from "@/components/Footer";

export default function Home() {
  const { hero, secondSection } = HomeContent;

  return (
    <div>
      <NavBar />

      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <main>
        <section className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl w-full font-bold text-center text-stone-200">
            {hero.title} <br />
            <LineShadowText
              className="mx-2 italic text-amber-200 text-8xl"
              shadowColor="#fdef7b"
            >
              {hero.highlightedText}
            </LineShadowText>
          </h1>
          <h2 className="text-lg text-stone-200/60 mt-4 w-xl text-center">
            VocEnglish to szkolna platforma do nauki angielskiego dla uczniów.
            Oferuje quizy, gry logiczne i edukacyjne, które pomagają rozwijać
            słownictwo i gramatykę w ciekawy i przyjazny sposób.
          </h2>
          <div className="-z-10">
            <DotPattern
              glow={false}
              className={cn(
                "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-50 -translate-y-1/40"
              )}
            />
          </div>
        </section>

        <section className="bg-neutral-950/20 text-stone-300 p-10 h-[30vh] flex items-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4">
              {secondSection.title}
            </h2>
            <p className="mb-4">{secondSection.paragraphs[0]}</p>
            <p>{secondSection.paragraphs[1]}</p>
          </div>
        </section>
      </main>
      <Footer />
      <NoiseFilter className="-z-10" />
    </div>
  );
}
