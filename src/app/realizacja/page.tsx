import React from "react";
import Image from "next/image";
import rs from "../../../public/radecky-studio-realizacja.svg";
import zs1 from "../../../public/zs1-logo.png";
import dif from "@/lib/dinfinite.svg";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import GlowingCircle from "@/components/ui/glowing-circle";
import { Link } from "lucide-react";

export default function RealizacjaPage() {
  return (
    <>
      <div className="hidden sm:block">
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b = text-neutral-100 relative top-20">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium mb-6 text-amber-200">
                Realizacja Projektu
              </h1>
              <div className="w-32 h-1 bg-amber-200 mx-auto mb-8"></div>
            </div>

            {/* Informacje o szkole */}
            <section className="mb-16 bg-neutral-800/20 border-dashed border border-neutral-700 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-amber-200">
                O Projekcie
              </h2>
              <p className="text-lg text-neutral-300 leading-relaxed mb-4">
                Platforma edukacyjna została stworzona przez uczniów klasy 4PI
                Zespołu Szkół nr 1 im. Władysława Orkana w Nowym Targu w ramach
                międzynarodowego programu ERASMUS+.
              </p>
              <p className="text-lg text-neutral-300 leading-relaxed">
                Celem projektu jest wspieranie nauki języków obcych oraz rozwój
                kompetencji cyfrowych uczniów poprzez interaktywną platformę
                edukacyjną.
              </p>
            </section>

            {/* Zespół projektowy */}
            <section className="mb-20 bg-neutral-800/20 rounded-2xl p-8 backdrop-blur-sm  border-dashed border border-neutral-700">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-amber-200">
                Zespół Projektowy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <h3 className="text-xl font-semibold mb-2">
                    Tomasz Tarnawski
                  </h3>
                  <p className="text-neutral-400">Back-end</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold mb-2">
                      Tomasz Radecki
                    </h3>

                    <a href="https://radecky-studio.tech" target="blank">
                      <Image
                        src={rs}
                        alt="Radecky Studio"
                        width={75}
                        className="object-contain"
                      />
                    </a>
                  </div>
                  <p className="text-neutral-400">Front-end</p>
                </div>

                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <h3 className="text-xl font-semibold mb-2">Kamil Wida</h3>
                  <p className="text-neutral-400">Gra Vocaba</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <h3 className="text-xl font-semibold mb-2">Zuzanna Zych</h3>
                  <p className="text-neutral-400">Gra Memory</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <h3 className="text-xl font-semibold mb-2">
                    Dominik Chrobak
                  </h3>
                  <p className="text-neutral-400">Gra Word-Matching</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold mb-2">
                      Przemek Gruca
                    </h3>

                    <a
                      href="https://www.instagram.com/prz3mek_gruca/"
                      target="blank"
                    >
                      <Image
                        src={dif}
                        alt="Radecky Studio"
                        width={65}
                        className="object-contain h-11"
                      />
                    </a>
                  </div>
                  <p className="text-neutral-400">Logo</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700 hover:border-amber-200 transition-colors">
                  <h3 className="text-xl font-semibold mb-2">
                    Dominik Leśniak
                  </h3>
                  <p className="text-neutral-400">Wprowadzanie słownictwa</p>
                </div>
              </div>
            </section>

            {/* Radecky Studio - usunięta osobna sekcja */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
