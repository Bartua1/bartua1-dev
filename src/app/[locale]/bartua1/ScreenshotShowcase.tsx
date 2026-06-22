'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SCREENSHOTS = [
  { src: '/dev/assets/FoodieDot/Foodie1.PNG', alt: 'Foodie Dot - Main Feed' },
  { src: '/dev/assets/FoodieDot/Foodie2.PNG', alt: 'Foodie Dot - Add Entry' },
  { src: '/dev/assets/FoodieDot/Foodie3.PNG', alt: 'Foodie Dot - Restaurant Detail' },
  { src: '/dev/assets/FoodieDot/Foodie4.PNG', alt: 'Foodie Dot - User Journal' },
];

interface ScreenshotShowcaseProps {
  tTitle: string;
  tDesc: string;
  tTech: string;
  tFeature1: string;
  tFeature2: string;
  tFeature3: string;
  tWebVersion: string;
  tAppStore: string;
  tPlayStore: string;
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function IconGooglePlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96 2.694-1.586Zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.295ZM1 13.396V2.603L6.846 8 1 13.396ZM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27Z" />
    </svg>
  );
}

export default function ScreenshotShowcase({
  tTitle,
  tDesc,
  tTech,
  tFeature1,
  tFeature2,
  tFeature3,
  tWebVersion,
  tAppStore,
  tPlayStore,
}: ScreenshotShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCREENSHOTS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left Column: Info & Details & Screenshots selector */}
      <div className="md:col-span-3 flex flex-col justify-between h-full">
        <div>
          {/* Header: Logo, Name, Badge */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 bg-white p-1 shadow-sm flex items-center justify-center">
              <Image
                src="/dev/assets/Foodie.png"
                alt="Foodie Dot Logo"
                width={56}
                height={56}
                className="object-cover rounded-xl w-full h-full"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {tTitle}
                </h3>
                <span className="text-[0.65rem] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-xs">
                  Live
                </span>
              </div>
              <p className="text-xs font-mono text-stone-400 mt-0.5">
                iOS · Android · Web App
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 mt-4 leading-relaxed">
            {tDesc}
          </p>

          {/* Bullet Highlights */}
          <ul className="mt-4 space-y-2">
            {[tFeature1, tFeature2, tFeature3].map((feat, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-stone-500">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-1.5 mt-5">
            {tTech.split(' · ').map((tech) => (
              <span
                key={tech}
                className="text-[0.6rem] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600 shadow-2xs hover:bg-stone-100 hover:text-stone-850 transition-colors duration-150 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Image Selector (Thumbnails) moved here */}
          <div className="mt-6">
            <p className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 mb-2">
              Screenshots
            </p>
            <div className="flex gap-2">
              {SCREENSHOTS.map((screen, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative w-12 sm:w-14 aspect-[9/19.2] rounded-lg overflow-hidden border-2 bg-stone-900 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    idx === activeIdx
                      ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20 scale-105 opacity-100'
                      : 'border-stone-200 opacity-55 hover:opacity-85'
                  }`}
                  aria-label={`View screenshot ${idx + 1}`}
                >
                  <Image
                    src={screen.src}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover object-top pointer-events-none"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Call To Actions */}
        <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-stone-100">
          <a
            href="https://foodiedot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-400 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm"
          >
            <IconArrow /> {tWebVersion}
          </a>
          <a
            href="https://apps.apple.com/es/app/foodie-dot-diario-culinario/id6761205862"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-0.5"
          >
            <IconApple /> {tAppStore}
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.foodiedot.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-0.5"
          >
            <IconGooglePlay /> {tPlayStore}
          </a>
        </div>
      </div>

      {/* Right Column: Newer iPhone Mockup Showcase */}
      <div className="md:col-span-2 flex justify-center items-center py-4 md:py-0 border-t md:border-t-0 md:border-l border-stone-100 md:pl-6">
        {/* Fixed-size wrapper container with aspect ratio to ensure it doesn't collapse */}
        <div className="relative w-[245px] sm:w-[260px] aspect-[9/19.2] selection:bg-transparent">
          {/* ── Side Buttons (Action, Vol Up/Down, Power) ── */}
          {/* Action button (Left) */}
          <div className="absolute left-[-3px] top-[75px] w-[3px] h-[16px] bg-stone-800 rounded-l-[2px] z-0 shadow-sm border border-stone-900" />
          {/* Volume Up (Left) */}
          <div className="absolute left-[-3px] top-[105px] w-[3px] h-[32px] bg-stone-800 rounded-l-[2px] z-0 shadow-sm border border-stone-900" />
          {/* Volume Down (Left) */}
          <div className="absolute left-[-3px] top-[148px] w-[3px] h-[32px] bg-stone-800 rounded-l-[2px] z-0 shadow-sm border border-stone-900" />
          {/* Power/Side button (Right) */}
          <div className="absolute right-[-3px] top-[110px] w-[3px] h-[50px] bg-stone-800 rounded-r-[2px] z-0 shadow-sm border border-stone-900" />

          {/* ── Phone Body (Newer iPhone Pro style with ultra-thin 5px bezels) ── */}
          <div className="relative w-full h-full rounded-[2.9rem] bg-black p-[5px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] border border-stone-850 ring-1 ring-stone-900/15 transition-all duration-500 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-1 z-10">
            
            {/* Dynamic Island */}
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[72px] h-[20px] bg-black rounded-full z-30 flex items-center justify-end pr-2.5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),_inset_0_-1px_2px_rgba(0,0,0,0.8)]">
              {/* Camera lens reflection + green dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-stone-950 flex items-center justify-center mr-0.5">
                <span className="w-0.5 h-0.5 rounded-full bg-blue-500/40"></span>
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-[#10b981]/50 shadow-[0_0_1px_#10b981]" />
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-18 h-1 bg-stone-600/50 rounded-full z-30" />

            {/* Screen Wrapper */}
            <div className="relative w-full h-full rounded-[2.6rem] overflow-hidden bg-stone-950">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.07] pointer-events-none z-20" />

              {/* Screenshots */}
              {SCREENSHOTS.map((screen, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    fill
                    sizes="(max-width: 640px) 245px, 260px"
                    className="object-cover object-top w-full h-full selection:bg-transparent"
                    unoptimized
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
