"use client";
import { IconArrowNarrowRight, IconInfoCircle } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  title: string;
  button: string;
  src: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button, title } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-col items-center justify-center relative text-center opacity-100 transition-all duration-300 ease-in-out w-[90vw] sm:w-[70vw] md:w-[55vmin] z-10 shrink-0 "
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        {/* Zdjęcie */}
        <div
          className="w-full h-[40vw] sm:h-[70vw] md:h-[55vmin] rounded-2xl overflow-hidden transition-all duration-300 ease-out flex items-center justify-center"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          <img
            className="w-full h-full object-contain transition-all duration-600 ease-in-out mx"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
        </div>

        {/* Modern tytuł pod zdjęciem z żółtym paskiem */}
        {current === index && (
          <div className="mt-3 sm:-mt-3 md:-mt-8 w-full animate-fadeIn flex flex-col items-center justify-center">
            <h2 className="text-lg sm:text-xl md:text-3xl font-semibold text-stone-200 mb-2 tracking-tight text-center px-2">
              {title}
            </h2>
            {/* Elegant underline */}
            <div className="flex justify-center mt-2 sm:mt-3">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent rounded-full" />
            </div>
          </div>
        )}
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-800 border-3 border-transparent rounded-full focus:border-amber-200 focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-200" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(2); // Start at 3rd slide (0-indexed)
  const [showCopyright, setShowCopyright] = useState(false);
  const [controlTop, setControlTop] = useState("calc(40vw + 10rem)");
  const [infoTop, setInfoTop] = useState("calc(40vw + 12.5rem)");
  const [modalTop, setModalTop] = useState("calc(40vw + 15.5rem)");

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  useEffect(() => {
    const updatePositions = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile - reduced height to 40vw, move buttons much lower
        setControlTop("calc(40vw + 10rem)");
        setInfoTop("calc(40vw + 12.5rem)");
        setModalTop("calc(40vw + 15.5rem)");
      } else if (width < 768) {
        // Small screens
        setControlTop("calc(70vw + 3rem)");
        setInfoTop("calc(70vw + 5rem)");
        setModalTop("calc(70vw + 8rem)");
      } else {
        // Desktop
        setControlTop("calc(55vmin + 4rem)");
        setInfoTop("calc(55vmin + 7rem)");
        setModalTop("calc(55vmin + 11rem)");
      }
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);
    return () => window.removeEventListener("resize", updatePositions);
  }, []);

  return (
    <div
      className="relative w-[90vw] sm:w-[70vw] md:w-[55vmin] "
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex transition-transform duration-1000 ease-in-out left-0"
        style={{
          transform: `translateX(-${(current * 100) / slides.length}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div
        className="absolute flex justify-center items-center left-0 right-0"
        style={{ top: controlTop }}
      >
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>

      <button
        onClick={() => setShowCopyright(!showCopyright)}
        className="absolute left-1/2 -translate-x-1/2 z-30 p-1.5 bg-neutral-700/30 hover:bg-neutral-700/60 rounded-full backdrop-blur-sm transition-all duration-200 opacity-60 hover:opacity-100"
        style={{ top: infoTop }}
        title="Informacje o zdjęciach"
      >
        <IconInfoCircle className="w-4 h-4 text-amber-200" />
      </button>

      {/* Modal z informacją o prawach autorskich */}
      {showCopyright && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30 bg-neutral-800/95 backdrop-blur-md border-2 border-neutral-700 rounded-lg p-4 shadow-xl max-w-xs"
          style={{ top: modalTop }}
        >
          <button
            onClick={() => setShowCopyright(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-white"
          >
            ✕
          </button>
          <p className="text-sm text-neutral-300 leading-relaxed">
            <strong className="text-amber-200">© Zespół Szkół nr 1</strong>
            <br />
            Wszystkie zdjęcia są własnością Zespołu Szkół nr 1 im. Władysława
            Orkana w Nowym Targu.
            <br />
            <span className="text-xs text-neutral-400 mt-2 block">
              Wszelkie prawa zastrzeżone.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
