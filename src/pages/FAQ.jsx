import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";

const SECTIONS = [
  {
    key: "backend",
    label: "backend",
    items: [
      {
        q: "what is running the backend?",
        a: "fanfolio uses a hosted database-as-a-service layer that stores all profile data. there is no custom node/express or python server. all data operations (read, write, filter, update) go through a typed sdk that abstracts the database. no serverless functions are written manually by the app. when porting to supabase, you replace the sdk with direct supabase client calls using the same interface shape.",
      },
      {
        q: "where is the app deployed?",
        a: "the frontend is a vite-built react spa deployed to a static hosting environment. the database layer is hosted separately. when self-hosting, you deploy the dist/ folder to any static host (vercel, netlify, cloudflare pages, github pages) and point the app at your own supabase project for data storage.",
      },
      {
        q: "what routes exist in the app?",
        a: "routing is entirely client-side via react-router-dom v6. the key routes are: / (creator wizard), /landing (landing page), /faq, /features, /account (claim your archives), /s/[id] (public profile view), /s/[id]/edit (edit with key), and /s/[id]/[mediaType]/[itemSlug] (media detail page). there are no server-side rendered routes.",
      },
      {
        q: "how does the edit key flow work?",
        a: "when a user publishes their archive, a 64-character hex string is generated on the client using crypto.getRandomValues(). this key is stored as a plain string on the profile record. to edit, the user visits /s/[id]/edit and enters their key, which is compared directly against the stored value. the key is also used as a url parameter (?key=...) to auto-unlock the media detail page when navigating from the editor. users can back up the key via .txt download or email.",
      },
    ],
  },
  {
    key: "frontend",
    label: "frontend",
    items: [
      {
        q: "what framework is this built in?",
        a: "react 18 with vite as the build tool. all routing is handled by react-router-dom v6. state is local react state (usestate, useeffect) and tanstack react query for async data fetching and caching.",
      },
      {
        q: "what component library is used?",
        a: "shadcn/ui built on top of radix ui primitives. all components live in components/ui/. styling is done with tailwind css using a custom design token system defined in index.css (css variables) mapped in tailwind.config.js. fonts are cormorant garamond for headings and inter for body text loaded from google fonts.",
      },
      {
        q: "what is the full tech stack?",
        a: "react 18, vite, react-router-dom v6, tanstack react query, tailwind css, shadcn/ui (radix ui), framer-motion for animations, @hello-pangea/dnd for drag and drop section and card reordering, lucide-react for icons, jszip for client-side zip export generation, date-fns for date utilities, and a typed sdk for all database and storage operations.",
      },
    ],
  },
  {
    key: "integrations",
    label: "integrations",
    items: [
      {
        q: "how does tmdb autocomplete work?",
        a: "entirely client-side. when a user types in an add media form, the usetmdbsearch hook fires a debounced fetch directly to the tmdb api from the browser. results populate a dropdown with cover images and metadata. no server-side proxy is used. you need a free tmdb api key set as vite_tmdb_api_key in your .env file.",
      },
      {
        q: "how does publishing and the page id system work?",
        a: "when a user publishes for the first time, a short random alphanumeric profile_id is generated on the client. this becomes the permanent identifier accessible at /s/[profile_id]. users can also set a custom slug (e.g. /s/my-name) stored as a separate field. both the id and the slug resolve to the same profile record.",
      },
      {
        q: "where does all the profile data go?",
        a: "all profile data including media items, characters, ships, tags, social links, fandoms, and enabled sections is stored as a single profile record. nested data like media items and characters are stored as json arrays on the profile document. on supabase this maps to jsonb columns on a single fanfolio_profiles table.",
      },
      {
        q: "how does export as zip work?",
        a: "the export zip feature runs entirely in the browser. the exportprofileaszip utility builds a static html string representing the profile, then uses jszip to bundle it with an index.html and minimal css file into a downloadable zip archive. no server is involved. the zip is generated in memory and triggered as a file download via a blob url.",
      },
      {
        q: "how does the account and claim system work?",
        a: "fanfolio is keyless by default so no account is needed to publish. the /account page lets you optionally create an account (email plus password via supabase auth) and then claim previously published archives by entering their edit keys. claimed archives get linked to your account user id in the database. once claimed you can see all your archives in one dashboard and access them without re-entering the key each time.",
      },
      {
        q: "how is the public profile page at /s/[id] generated?",
        a: "there is no server-side rendering or static generation. it is a client-side react route that loads the profile record from the database by filtering on profile_id or slug. the profiledisplayview component renders the full profile from that data. every visit hits the database live.",
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

export default function FAQ() {
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
          <Link to="/features" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">features</Link>
          <Link to="/landing" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">home</Link>
          <Link
            to="/"
            className="px-5 py-2 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
          >
            build yours
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-primary inline-block" />
          under the hood
        </p>
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4">
          frequently asked<br /><em>questions.</em>
        </h1>
        <p className="font-body text-muted-foreground text-base mb-20 max-w-lg leading-relaxed">
          everything about how fanfolio works — the tech, the architecture, and the decisions behind it.
        </p>

        <div className="space-y-16">
          {SECTIONS.map((section) => (
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