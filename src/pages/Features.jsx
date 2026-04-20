import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";

const FEATURE_SECTIONS = [
  {
    key: "archive",
    label: "building your archive",
    items: [
      {
        q: "what media types can i add?",
        a: "you can add tv shows, movies, documentaries, books, music artists, podcasts, video games, anime, fanfiction, and creators. each type gets its own section on your profile with a dedicated card grid layout. you choose which sections to show and the order they appear in.",
      },
      {
        q: "how do i add items to a section?",
        a: "click the plus icon next to any section heading while in edit mode. a dialog opens where you can type a title and it will autocomplete from tmdb (for tv, movies, anime, games) or let you fill in details manually. you can upload a cover image, add a subtitle, and for fanfiction or creators you can attach an external link.",
      },
      {
        q: "can i reorder my sections and cards?",
        a: "yes. in edit mode you can drag and drop entire sections to reorder them, or use the up/down arrows that appear on hover. within each section you can drag and drop individual cards to reorder them. the order is saved when you click save changes.",
      },
      {
        q: "is there a limit on how many items i can add?",
        a: "no limits. add as many items per section as you want. sections with more than four items show a collapsed row by default with an expand button that shows the full grid.",
      },
    ],
  },
  {
    key: "detail",
    label: "media detail pages",
    items: [
      {
        q: "what is a media detail page?",
        a: "every item in your archive has its own full dedicated page at /s/[id]/[type]/[title-slug]. you can write long-form notes, add a favourite quote, set a rating, and for narrative media (shows, anime, books, games, movies) you can link favourite characters, ships, and fics from the ones already in your profile.",
      },
      {
        q: "how do i access and edit my media detail page?",
        a: "click the expand icon on any media card modal. if you are logged in as the owner (via edit key or account), the page auto-unlocks. you can then edit the notes, quote, rating, tags, characters and ships inline and hit save to persist.",
      },
      {
        q: "what are the fav characters and fav ships fields?",
        a: "these fields let you connect characters and ships from your profile's characters and ships sections to a specific media item. fanfolio prioritises characters/ships whose source field matches the current title to show at the top of the suggestion dropdown. you can also type any name that is not yet in your profile.",
      },
      {
        q: "what are item tags?",
        a: "a comma-separated list of freeform tags specific to that item, separate from your global tropes and tags section. for example you might tag a show as slow burn, ensemble cast, comfort rewatch. they display as pill badges on the detail page.",
      },
    ],
  },
  {
    key: "fandom",
    label: "fandom sections",
    items: [
      {
        q: "what is the fandoms section?",
        a: "the fandoms section lets you list the fandoms you are active in (e.g. jujutsu kaisen, mcu, taylor swift) with optional short notes for each. you can also add fandom spaces which are community-specific tags like booktwt, filmtwt, kpoptwt, ao3, etc. these can be selected from presets or typed manually.",
      },
      {
        q: "how do characters and ships work?",
        a: "characters and ships are profile-level entries stored in their own sections. each character has a name and a source (the show/book/game it is from). each ship has a name, an optional source, optional character names, optional tropes, and a note. you can add as many as you want and they appear as a visual grid.",
      },
      {
        q: "what are tropes and tags?",
        a: "a profile-level tag collection displayed as a scrolling strip. each tag has a name and a type (trope, genre, ao3 tag, or arc). they are shown in a marquee strip on your public profile. examples: enemies to lovers, found family, dark academia, slow burn.",
      },
    ],
  },
  {
    key: "owning",
    label: "owning your archive",
    items: [
      {
        q: "what is the edit key and how does it work?",
        a: "the edit key is a 64-character hex string generated in your browser using crypto.getRandomValues() when you first publish. it is stored on your profile record. to edit your profile later you visit /s/[id]/edit and enter the key. the key is compared directly. there is no password reset, so backing it up is critical.",
      },
      {
        q: "how do i back up my edit key?",
        a: "from the success screen after publishing, or from the settings panel inside the editor, you can email yourself the key, download it as a .txt file, or export your entire archive as a zip. the settings panel also shows your original profile url and lets you set a custom slug.",
      },
      {
        q: "what is the custom url slug?",
        a: "by default your profile lives at /s/[random-id]. in the settings panel you can claim a custom slug like /s/yourname so your url becomes readable and shareable. the original id url continues to work as well.",
      },
      {
        q: "how does the account and claim system work?",
        a: "fanfolio is completely keyless by default so no account is ever required. but if you want to manage multiple archives in one place, you can create an account on the /account page using just an email and password. you can then claim any previously published archive by entering its edit key. once claimed, the archive is linked to your account and appears in your dashboard. you can access it without re-entering the key each time.",
      },
      {
        q: "what does export as zip give me?",
        a: "a fully self-contained static html site of your profile. it includes an index.html and minimal css so you can open it in any browser with no server, or host it on neocities, github pages, or any static host. it will work indefinitely regardless of what happens to fanfolio.",
      },
    ],
  },
  {
    key: "display",
    label: "display and customisation",
    items: [
      {
        q: "is there a dark mode?",
        a: "yes. a dark mode toggle is present on every page including the public profile view. the preference is saved in localstorage under fanfolio-dark and persists across visits.",
      },
      {
        q: "can visitors see my profile without an account?",
        a: "yes. your public profile at /s/[id] is fully public and requires no account from viewers. only editing requires the edit key.",
      },
      {
        q: "can i control which sections are visible?",
        a: "yes. in edit mode you can toggle any section on or off and reorder them. hidden sections are not shown on the public profile at all.",
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-body text-sm md:text-base leading-snug group-hover:text-primary transition-colors">{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="font-body text-sm text-muted-foreground leading-relaxed pb-5 max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FEATURE_GRID = [
  { label: "10 media types", desc: "tv, movies, books, music, games, podcasts, anime, docs, fanfiction, creators" },
  { label: "tmdb autocomplete", desc: "search and autofill covers from the movie database for tv, movies, anime and games" },
  { label: "media detail pages", desc: "every item gets its own page for notes, quotes, ratings, characters and ships" },
  { label: "drag and drop", desc: "reorder sections and cards by dragging, both on desktop and mobile" },
  { label: "characters and ships", desc: "dedicated sections for your favs with source linking to media items" },
  { label: "tropes and tags", desc: "scrolling marquee strip of your favourite tropes, genres and ao3 tags" },
  { label: "fandoms and spaces", desc: "list your active fandoms and community spaces like booktwt or filmtwt" },
  { label: "social links", desc: "link out to letterboxd, ao3, bluesky, twitter, ko-fi and more" },
  { label: "no account required", desc: "publish and edit with just an edit key. no sign-up ever forced on you" },
  { label: "claim system", desc: "optionally create an account to manage multiple archives in one dashboard" },
  { label: "custom slug", desc: "replace the random id url with /s/yourname" },
  { label: "export as zip", desc: "download your entire archive as a standalone static html site" },
  { label: "dark and light mode", desc: "toggle persists in localstorage across all visits" },
  { label: "key email backup", desc: "send your edit key to any email directly from the settings panel" },
  { label: "no section limits", desc: "add as many items and sections as you want, no paywalls" },
];

export default function Features() {
  const [open, setOpen] = useState({});

  const toggle = (sectionKey, idx) => {
    const key = `${sectionKey}-${idx}`;
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/landing" className="font-mono text-[11px] tracking-widest uppercase text-primary">fanfolio</Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link to="/faq" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">faq</Link>
          <Link to="/landing" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">home</Link>
          <Link
            to="/"
            className="px-5 py-2 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
          >
            build yours
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-primary inline-block" />
          what you get
        </p>
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4">
          every feature,<br /><em>explained.</em>
        </h1>
        <p className="font-body text-muted-foreground text-base mb-20 max-w-lg leading-relaxed">
          fanfolio is free, has no account requirement, and no section limits. here is everything it can do.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
          {FEATURE_GRID.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="border border-border rounded-sm p-5"
            >
              <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-1">{f.label}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed accordions */}
        <div className="space-y-16">
          {FEATURE_SECTIONS.map((section) => (
            <div key={section.key}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-primary inline-block" />
                <h2 className="font-mono text-[11px] tracking-widest uppercase text-primary">{section.label}</h2>
              </div>
              <div className="border border-border rounded-sm px-6">
                {section.items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    q={item.q}
                    a={item.a}
                    isOpen={!!open[`${section.key}-${idx}`]}
                    onToggle={() => toggle(section.key, idx)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">fanfolio — a curated taste archive</p>
          <Link to="/" className="font-mono text-[10px] tracking-widest uppercase text-primary hover:underline transition-colors">
            build my archive →
          </Link>
        </div>
      </div>
    </div>
  );
}