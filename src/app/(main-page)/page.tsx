import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import { HomeContent } from "@/data/HomeContent";
import Footer from "@/components/Footer";
import icon from "@/lib/NavIcon.svg";
import Image from "next/image";
import { AnimatedBeamMultipleOutputDemo } from "@/components/UserBeam";
import { Particles } from "@/components/ui/particles";

export default function Home() {
  const { hero, secondSection } = HomeContent;

  return (
    <div>
      <NavBar />

      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <main className="pt-10">
        <section className="min-h-[100svh] flex flex-col items-center justify-center border-b-2 border-neutral-800 px-4 text-center">
          <div className="bg-neutral-700/50 rounded-md w-12 h-11 mx-1 backdrop-blur-md flex items-center justify-center m-2">
            <Image src={icon} width={45} alt={hero.iconAlt} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl w-full font-bold text-stone-200">
            {hero.title} <br />
            <LineShadowText
              className="mx-2 italic text-amber-200 text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              shadowColor="#fdef7b"
            >
              {hero.highlightedText}
            </LineShadowText>
          </h1>
          <h2 className="text-base sm:text-lg text-stone-200/70 mt-4 max-w-2xl mx-auto px-2">
            {hero.heroDescription}
          </h2>
          <div className="-z-10">
            <DotPattern
              glow={false}
              className={cn(
                "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] sm:[mask-image:radial-gradient(450px_circle_at_center,white,transparent)] md:[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-50 -translate-y-1/40"
              )}
            />
          </div>
        </section>

        <section className="bg-neutral-900/40 text-stone-300 px-4 sm:px-6 lg:px-10 py-10 flex flex-col items-center">
          <div className="max-w-4xl text-center min-h-12 my-6 sm:my-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 sm:mb-4">
              {secondSection.title}
            </h2>
          </div>
          <div className="relative w-full overflow-hidden">
            <Particles
              className="absolute inset-0 z-0  opacity-25"
              size={0.15}
              quantity={50}
            />
            <AnimatedBeamMultipleOutputDemo />
          </div>
        </section>
      </main>
      <Footer />
      <NoiseFilter className="-z-10" />
    </div>
  );
}
