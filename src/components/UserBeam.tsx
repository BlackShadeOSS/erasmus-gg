"use client";

import React, { forwardRef, useRef } from "react";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import VocIcon from "@/lib/NavIcon-dark.svg";
import DuolingoIcon from "@/lib/duolingo.svg";
import GoogleClassroomIcon from "@/lib/classroom.svg";
import InstaLingIcon from "@/lib/Instaling.svg";
import NotionIcon from "@/lib/notion.svg";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; title?: string }
>(({ className, children, title }, ref) => {
  return (
    <div
      title={title}
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);

  const gradientStartColorBlue = "#34d399";
  const gradientStopColorBlue = "#3b82f6";

  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10",
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref} title="Classroom">
            <Image src={GoogleClassroomIcon} alt="Google Classroom" />
          </Circle>
          <Circle ref={div2Ref} title="InstaLing">
            <Image src={InstaLingIcon} alt="Google Docs" />
          </Circle>
          <Circle ref={div3Ref} title="Notion">
            <Image src={NotionIcon} alt="Notion" />
          </Circle>
          <Circle ref={div4Ref} title="Duolingo">
            <Image src={DuolingoIcon} alt="Duolingo" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div5Ref} className="size-16 ">
            <Image src={VocIcon} alt="Voc" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref}>
            <Icons.user />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div5Ref}
        gradientStartColor={gradientStartColorBlue}
        gradientStopColor={gradientStopColorBlue}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div5Ref}
        gradientStartColor={gradientStartColorBlue}
        gradientStopColor={gradientStopColorBlue}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div5Ref}
        gradientStartColor={gradientStartColorBlue}
        gradientStopColor={gradientStopColorBlue}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div5Ref}
        gradientStartColor={gradientStartColorBlue}
        gradientStopColor={gradientStopColorBlue}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div5Ref}
        gradientStartColor={gradientStartColorBlue}
        gradientStopColor={gradientStopColorBlue}
      />
    </div>
  );
}

const Icons = {
  user: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};
