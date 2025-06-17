import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";

export default function Home() {
  return (
    <div>
      <NavBar />
      <GlowingCircle />
      <GlowingCircle isRight={true} />
      <main>
        <section className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-7xl w-full font-bold text-center text-white">
            Ucz się z <br />
            <LineShadowText
              className="mx-2 italic text-[#fdef7b]"
              shadowColor="#fdef7b"
            >
              VocEnglish
            </LineShadowText>
          </h1>
          <div className="-z-10">
            <DotPattern
              glow={false}
              className={cn(
                "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-50 -translate-y-1/20"
              )}
            />
          </div>
        </section>

        <section className="bg-gray-100 text-gray-900 p-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4">
              dalsza czesc strony etc etc.
            </h2>
            <p className="mb-4">
              BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA
              BLA BLA BLA BLA BLA BLA BLA BLA BLA
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac
              justo ut eros ornare malesuada.
            </p>
          </div>
        </section>
      </main>
      <NoiseFilter className="z-[-100]" />
    </div>
  );
}
