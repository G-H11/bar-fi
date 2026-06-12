"use client";

import Image from "next/image";

type HeroSectionProps = {
  bgImage: string;
  emoji: string;
  title: string;
  subtitle: string;
  description?: string;
  children?: React.ReactNode;
};

/**
 * Reusable Hero Section with background image + gradient overlay
 */
const HeroSection = ({ bgImage, emoji, title, subtitle, description, children }: HeroSectionProps) => {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image src={bgImage} alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(4,68,68,0.85) 100%)",
          }}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl">
          <div className="text-5xl md:text-6xl mb-3">{emoji}</div>
          <h1
            className="text-4xl md:text-6xl font-black tracking-wider mb-2"
            style={{ color: "var(--color-neutral-content)" }}
          >
            {title}
          </h1>
          <p
            className="text-lg md:text-xl font-light tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--color-neutral-content)" }}
          >
            {subtitle}
          </p>
          <div className="w-20 h-px mx-auto my-3" style={{ background: "var(--color-neutral-content)" }} />
          {description && (
            <p className="text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed" style={{ color: "var(--color-neutral-content)" }}>
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: "linear-gradient(to top, var(--color-base-200) 0%, transparent 100%)" }}
      />
    </div>
  );
};

export default HeroSection;
