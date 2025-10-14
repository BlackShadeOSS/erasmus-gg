import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import { HomeContent } from "@/data/HomeContent";
import Footer from "@/components/Footer";
import icon from "@/lib/NavIcon-dark.svg";
import Image from "next/image";
import { AnimatedBeamMultipleOutputDemo } from "@/components/UserBeam";
import { Particles } from "@/components/ui/particles";
import PhotoGallery from "@/components/ui/photo-gallery";

// Import zdjęć specjalizacji
import fotograf from "@/lib/specializations/fotograf.jpg";
import grafik from "@/lib/specializations/grafik.jpg";
import informatyk from "@/lib/specializations/informatyk.jpg";
import logistyk from "@/lib/specializations/logistyk.jpg";
import moda from "@/lib/specializations/moda.jpg";
import programista from "@/lib/specializations/programista.jpg";
import reklama from "@/lib/specializations/reklama.jpg";

export default function Home() {
  const { hero, secondSection } = HomeContent;

  // Dane dla slajdów z specjalizacjami
  const specializationSlides = [
    {
      title: "Technik Informatyk",
      description: "Projektowanie i administracja systemami komputerowymi",
      src: informatyk.src,
    },
    {
      title: "Technik Programista",
      description: "Tworzenie aplikacji i rozwiązań programistycznych",
      src: programista.src,
    },
    {
      title: "Technik Grafiki i Poligrafii Cyfrowej",
      description: "Design graficzny i przygotowanie publikacji",
      src: grafik.src,
    },
    {
      title: "Technik Fotograf",
      description: "Profesjonalna fotografia i obróbka obrazu",
      src: fotograf.src,
    },
    {
      title: "Technik Reklamy",
      description: "Kampanie reklamowe i marketing wizualny",
      src: reklama.src,
    },
    {
      title: "Technik Przemysłu Mody",
      description: "Projektowanie i technologia odzieży",
      src: moda.src,
    },
    {
      title: "Technik Logistyk",
      description: "Zarządzanie łańcuchem dostaw i magazynowanie",
      src: logistyk.src,
    },
  ];

  return (
    <div className="overflow-x-hidden caret-transparent">
      <NavBar />

      <div className="hidden sm:block">
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <div className="block sm:hidden">
        <GlowingCircle mobile />
      </div>

      <main className="pt-10">
        {/* Hero Section */}
        <section className="min-h-[100svh] flex flex-col items-center justify-center border-b-2 border-neutral-800 px-4 text-center relative">
          <div className="bg-amber-200 rounded-md w-12 h-12 mx-1 backdrop-blur-md flex items-center justify-center m-2">
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
          <h2 className="text-base sm:text-xl text-stone-200/70 mt-4 max-w-2xl mx-auto px-2">
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

          {/* Scroll indicator - myszka */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Features Section z boxami */}
        <section className="bg-neutral-900/40 text-stone-300 px-4 sm:px-6 lg:px-10 py-20 flex flex-col items-center border-b-2 border-neutral-800">
          <div className="max-w-4xl text-center min-h-12 my-6 sm:my-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 sm:mb-4">
              {secondSection.title}
            </h2>
          </div>

          <div className="relative w-full overflow-hidden mb-16">
            <Particles
              className="absolute inset-0 z-0 opacity-40"
              color="#fff"
              size={0.05}
              quantity={80}
              staticity={80}
              ease={20}
              vx={0.09}
              vy={-0.15}
              alphaMultiplier={1.2}
            />
            <AnimatedBeamMultipleOutputDemo />
          </div>

          {/* Feature Boxes - przeniesione pod beam */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: "🎯",
                title: "Spersonalizowana",
                desc: "Dostosuj tempo nauki do swoich potrzeb",
              },
              {
                icon: "🚀",
                title: "Interaktywna",
                desc: "Ćwiczenia i gry edukacyjne",
              },
              {
                icon: "📊",
                title: "Śledź Postępy",
                desc: "Monitoruj swój rozwój w czasie rzeczywistym",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-neutral-900/50 backdrop-blur-xl rounded-2xl p-8 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Specializations Gallery */}
        <section className="min-h-[70svh] sm:min-h-[95svh] flex flex-col bg-neutral-900/20 items-center justify-center py-16 selection:bg-transparent selection:text-amber-200">
          <div className="max-w-6xl w-full text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-stone-200 select-none">
              Nasze Specjalizacje
            </h2>
          </div>
          <PhotoGallery
            slides={specializationSlides}
            autoPlay={true}
            autoPlayInterval={5000}
          />
        </section>
      </main>

      <Footer />
      <NoiseFilter className="-z-10" />
    </div>
  );
}
