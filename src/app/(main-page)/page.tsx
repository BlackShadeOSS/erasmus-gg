import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import { HomeContent } from "@/data/HomeContent";
import Footer from "@/components/Footer";
import ImageComponent from "@/components/ImageComponent";

export default function Home() {
  const { hero, secondSection } = HomeContent;

  // Create an array to loop through for our images
  const imageCount = 6; // Number of images to display

  return (
    <div>
      <NavBar />

      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <main>
        <section className="h-screen flex flex-col items-center justify-center ">
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
            {hero.heroDescription}
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

        <section className="bg-neutral-900/40 text-stone-300 p-10 flex flex-col items-center">
          <div className="max-w-4xl text-center h-20 my-10">
            <h2 className="text-5xl font-semibold mb-4">
              {secondSection.title}
            </h2>
          </div>
          <div className="w-full">
            {Array.from({ length: imageCount }).map((_, index) => (
              <ImageComponent
                key={index}
                header={secondSection.images.programista.header}
                src={secondSection.images.programista.image}
                alt={secondSection.images.programista.alt}
                width={800}
                height={800}
                position={index % 2 === 0 ? "left" : "right"}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <NoiseFilter className="-z-10" />
    </div>
  );
}
