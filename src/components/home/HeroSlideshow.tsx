'use client';

import { useEffect, useState } from 'react';
import { HERO_SCENES } from '@/lib/destinationImages';
import { SearchWidget } from '@/components/search/SearchWidget';

const SCENE_DURATION_MS = 6000;

export function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_SCENES.length);
    }, SCENE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-navy-950">
      {HERO_SCENES.map((scene, i) => (
        <div
          key={scene.key}
          aria-hidden={i !== activeIndex}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${scene.image})`,
              filter: 'filter' in scene ? scene.filter : undefined,
              animation: i === activeIndex ? `ken-burns ${SCENE_DURATION_MS + 1500}ms ease-out forwards` : undefined,
            }}
          />
          {'tint' in scene && (
            <div className="absolute inset-0 mix-blend-overlay" style={{ background: scene.tint }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/10" />
        </div>
      ))}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-500">
          {HERO_SCENES[activeIndex].eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
          {HERO_SCENES[activeIndex].headline}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-slate-200">{HERO_SCENES[activeIndex].body}</p>

        <div className="mt-8">
          <SearchWidget />
        </div>
        <p className="mt-4 text-sm text-slate-300">Members save up to 35% on selected deals.</p>

        <div className="mt-8 flex gap-2">
          {HERO_SCENES.map((scene, i) => (
            <button
              key={scene.key}
              aria-label={`Show ${scene.headline}`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-8 bg-accent-500' : 'w-4 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ken-burns {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }
      `}</style>
    </section>
  );
}
