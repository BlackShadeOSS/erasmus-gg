"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";

interface GallerySlide {
  title: string;
  description?: string;
  src: string;
  button?: string;
}

interface PhotoGalleryProps {
  slides: GallerySlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function PhotoGallery({
  slides,
  autoPlay = false,
  autoPlayInterval = 5000,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isModalOpen) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, autoPlayInterval, isModalOpen]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
        {/* Main Image Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 shadow-2xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src={slides[currentIndex].src}
                alt={slides[currentIndex].title}
                fill
                className="object-cover"
                priority
                quality={90}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Title Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-4 sm:p-8"
              >
                <h3 className="text-lg sm:text-3xl md:text-4xl font-bold text-white mb-0 sm:mb-2">
                  {slides[currentIndex].title}
                </h3>
                {slides[currentIndex].description && (
                  <p className="text-xs sm:text-base text-neutral-200 max-w-2xl">
                    {slides[currentIndex].description}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Previous slide"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Next slide"
          >
            <IconChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-10 g flex gap-2 sm:gap-3 justify-center pb-4 scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-neutral-800 relative z-0">
          {slides.map((slide, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentIndex
                  ? "ring-2 ring-amber-500"
                  : "ring-2 ring-neutral-700 hover:ring-amber-400 opacity-60 hover:opacity-100"
              }`}
              whileHover={{ scale: index === currentIndex ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                className="object-cover"
                sizes="100px"
              />
              {index === currentIndex && (
                <motion.div
                  layoutId="activeSlide"
                  className="absolute inset-0 bg-amber-500/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm text-neutral-400">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all z-10"
              aria-label="Close modal"
            >
              <IconX className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={slides[currentIndex].src}
                alt={slides[currentIndex].title}
                fill
                className="object-contain"
                quality={100}
              />
            </motion.div>

            {/* Modal Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
            >
              <IconChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
            >
              <IconChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
