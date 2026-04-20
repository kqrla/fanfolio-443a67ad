import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const SCREEN_1_SECTIONS = [
  { key: "tv_show",     label: "tv shows",       desc: "series you obsess over" },
  { key: "movie",       label: "movies",          desc: "films that wrecked you" },
  { key: "book",        label: "books",           desc: "stories you return to" },
  { key: "artist",      label: "music artists",   desc: "music that defines you" },
  { key: "video_game",  label: "video games",     desc: "worlds you've lived in" },
  { key: "podcast",     label: "podcasts",        desc: "voices you trust" },
  { key: "anime",       label: "anime",           desc: "animation that moved you" },
  { key: "documentary", label: "documentaries",   desc: "reality that changed you" },
  { key: "fanfiction",  label: "fanfiction",      desc: "fics burned into memory" },
  { key: "creator",     label: "creators",        desc: "people whose work you follow" },
];

const SCREEN_2_SECTIONS = [
  { key: "fandoms",    label: "fandoms",       desc: "communities you belong to" },
  { key: "characters", label: "characters",    desc: "people who aren't real but feel real" },
  { key: "ships",      label: "ships",         desc: "relationships you believe in" },
  { key: "tags",       label: "tropes & tags", desc: "the patterns you love" },
];

const SCREEN_3_SECTIONS = [
  { key: "social_links", label: "social links",  desc: "find me elsewhere" },
];

function SectionToggle({ section, isActive, onClick, index }) {
  return (
    <motion.button
      key={section.key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 border rounded-sm transition-all text-left ${
        isActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <div>
        <span className={`font-body text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
          {section.label}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground ml-3">{section.desc}</span>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        isActive ? "border-primary bg-primary" : "border-border"
      }`}>
        {isActive && (
          <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </motion.button>
  );
}

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/40" : "w-4 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

export default function SectionSelector({ selected, onChange, onContinue }) {
  const [screen, setScreen] = useState(1);

  const toggle = (key) => {
    onChange(
      selected.includes(key) ? selected.filter((s) => s !== key) : [...selected, key]
    );
  };

  const handleFinalContinue = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">

        {/* ── SCREEN 1: Media types ── */}
        {screen === 1 && (
          <AnimatePresence mode="wait">
            <motion.div key="screen1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-4">fanfolio</p>
                <StepDots step={1} />
                <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight leading-none">
                  what do you<br />consume?
                </h1>
                <p className="font-body text-muted-foreground mt-5 text-base leading-relaxed max-w-md">
                  pick the types of media you want to feature on your profile.
                </p>
              </div>

              <div className="space-y-2 mb-10 mt-8">
                {SCREEN_1_SECTIONS.map((section, i) => (
                  <SectionToggle
                    key={section.key}
                    section={section}
                    isActive={selected.includes(section.key)}
                    onClick={() => toggle(section.key)}
                    index={i}
                  />
                ))}
              </div>

              <button
                onClick={() => setScreen(2)}
                className="w-full py-4 bg-foreground text-background font-mono text-xs tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
              >
                continue → fandom picks
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── SCREEN 2: Fandom sections ── */}
        {screen === 2 && (
          <AnimatePresence mode="wait">
            <motion.div key="screen2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-4">fanfolio</p>
                <StepDots step={2} />
                <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight leading-none">
                  what are you<br />a fan of?
                </h1>
                <p className="font-body text-muted-foreground mt-5 text-base leading-relaxed max-w-md">
                  add fandom-specific sections — fandoms, characters, ships, and the tropes you love.
                </p>
              </div>

              <div className="space-y-2 mb-10 mt-8">
                {SCREEN_2_SECTIONS.map((section, i) => (
                  <SectionToggle
                    key={section.key}
                    section={section}
                    isActive={selected.includes(section.key)}
                    onClick={() => toggle(section.key)}
                    index={i}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setScreen(1)}
                  className="px-6 py-4 border border-border text-foreground font-mono text-xs tracking-widest uppercase hover:border-foreground/50 transition-colors rounded-sm"
                >
                  ← back
                </button>
                <button
                  onClick={() => setScreen(3)}
                  className="flex-1 py-4 bg-foreground text-background font-mono text-xs tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
                >
                  continue → profile & links
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── SCREEN 3: Profile & social links ── */}
        {screen === 3 && (
          <AnimatePresence mode="wait">
            <motion.div key="screen3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-4">fanfolio</p>
                <StepDots step={3} />
                <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight leading-none">
                  how do people<br />find you?
                </h1>
                <p className="font-body text-muted-foreground mt-5 text-base leading-relaxed max-w-md">
                  these are all optional. choose what you'd like to show on your profile.
                </p>
              </div>

              <div className="mt-8 mb-10">
                <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3">social links</p>
                <div className="space-y-2">
                  {SCREEN_3_SECTIONS.map((section, i) => (
                    <SectionToggle
                      key={section.key}
                      section={section}
                      isActive={selected.includes(section.key)}
                      onClick={() => toggle(section.key)}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setScreen(2)}
                  className="px-6 py-4 border border-border text-foreground font-mono text-xs tracking-widest uppercase hover:border-foreground/50 transition-colors rounded-sm"
                >
                  ← back
                </button>
                <button
                  onClick={handleFinalContinue}
                  className="flex-1 py-4 bg-foreground text-background font-mono text-xs tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
                >
                  build my archive →
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}