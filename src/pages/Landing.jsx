import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";

const FEATURES = [
  {
    label: "no account required",
    desc: "publish and edit your archive without signing up. no email. no password. just a key.",
  },
  {
    label: "yours forever",
    desc: "export your entire archive as a zip anytime. host it yourself on neocities, github pages, or anywhere.",
  },
  {
    label: "build freely",
    desc: "no section limits. add as many fandoms, shows, characters, ships, and notes as you want.",
  },
  {
    label: "portable format",
    desc: "your archive downloads as a static html site. it will open in any browser in 2035.",
  },
];

const MEDIA_SECTIONS = [
  "tv shows", "movies", "books", "music artists", "video games",
  "podcasts", "anime", "documentaries", "fanfiction", "creators",
];

const FANDOM_SECTIONS = [
  "fandoms & communities", "characters", "ships", "tropes & tags", "social links",
];

const PER_ITEM = [
  "full notes page", "favourite quote", "ratings", "fav characters",
  "fav ships", "linked fics", "comma-separated tags",
];

const STEPS = [
  {
    n: "01",
    title: "pick your sections",
    desc: "tv shows, books, music, anime, games, podcasts, fanfiction, creators. choose what you consume. no limits on how many.",
  },
  {
    n: "02",
    title: "go deeper into fandoms",
    desc: "add character pages, ships, tropes. connect shows to characters. build the wiki energy you have always wanted.",
  },
  {
    n: "03",
    title: "annotate everything",
    desc: "every item gets a full notes page. add a rating, a favourite quote, linked fics, and a long ramble. no character limit.",
  },
  {
    n: "04",
    title: "publish or export",
    desc: "publish instantly with no account and get a shareable link. or download your whole archive as a zip and host it anywhere.",
  },
];

const MARQUEE_TEXT = "bc we're all just museums of everything we've ever loved";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-4 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link to="/" className="flex flex-col leading-none flex-shrink-0">
          <span className="font-mono text-[11px] tracking-widest uppercase text-primary">fanfolio</span>
          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">by ocverse</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <DarkModeToggle />
          <Link to="/features" className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">features</Link>
          <Link to="/faq" className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">faq</Link>
          <Link to="/letters" className="hidden md:inline font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">letters</Link>
          <Link
            to="/"
            className="px-3 sm:px-5 py-2 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm whitespace-nowrap"
          >
            build yours
          </Link>
          <Link
            to="/account"
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors flex-shrink-0"
            title="account"
          >
            <User className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[90vh] flex items-center relative px-6 md:px-12 pt-16 pb-24">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-primary inline-block" />
            a curated archive of your inner world
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading font-light tracking-tight leading-none text-foreground"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
          >
            build a page around<br />
            <em>everything</em> you love
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-body text-lg md:text-xl text-muted-foreground mt-8 max-w-xl leading-relaxed"
          >
            a personal archive for your favourite books, artists, shows, ships, characters, and more.
            ramble about them. connect them. make it yours.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mt-3"
          >
            no platform that will die on you. no account required. yours forever.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-5 mt-10"
          >
            <Link
              to="/"
              className="px-8 py-4 bg-foreground text-background font-mono text-[11px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
            >
              build my archive
            </Link>
            <span className="font-mono text-[10px] text-muted-foreground">free. no account required.</span>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-border" />
      </section>

      {/* Marquee */}
      <div className="overflow-hidden bg-foreground py-4">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {Array(8).fill(MARQUEE_TEXT).map((t, i) => (
            <span key={i} className="font-mono text-[11px] tracking-widest uppercase text-background opacity-70 flex-shrink-0">
              {t} <span className="text-primary mx-3">✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* Why */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-primary inline-block" />
            the internet keeps dying. this won't.
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light leading-tight mb-6">
            your taste is yours.<br /><em>not the platform's.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg text-base leading-relaxed mb-16">
            tumblr died. delicious died. geocities died. last.fm stripped itself bare.
            we are tired of rebuilding from scratch every five years.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="border border-border rounded-sm p-6"
              >
                <h3 className="font-heading text-xl font-light mb-2">{f.label}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-36 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-primary inline-block" />
            how it works
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light mb-16">four steps to your archive</h2>
          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-8 md:gap-16 py-10 border-b border-border items-start"
              >
                <span className="font-mono text-[11px] tracking-widest text-primary flex-shrink-0 pt-1">{s.n}</span>
                <div>
                  <h3 className="font-heading text-2xl md:text-3xl font-light mb-2">{s.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed max-w-lg">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can add */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-primary inline-block" />
            everything you can add
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light mb-16">your taste, fully catalogued</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">media sections</p>
              <div className="space-y-2">
                {MEDIA_SECTIONS.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-body text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">fandom sections</p>
              <div className="space-y-2">
                {FANDOM_SECTIONS.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-body text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">per-item features</p>
              <div className="space-y-2">
                {PER_ITEM.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-body text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-heading font-light tracking-tight leading-none mb-8"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            start your archive<br /><em>today.</em>
          </h2>
          <p className="font-body text-muted-foreground mb-10">free. no account. yours forever.</p>
          <Link
            to="/"
            className="inline-block px-10 py-4 bg-foreground text-background font-mono text-[11px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
          >
            build my archive →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex flex-col leading-none mb-3">
            <span className="font-mono text-[11px] tracking-widest uppercase text-foreground">fanfolio</span>
            <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">by ocverse</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            questions? <a href="mailto:support@ocverse.site" className="text-primary hover:underline transition-colors">support@ocverse.site</a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/features" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">features</Link>
          <Link to="/faq" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">faq</Link>
          <Link to="/letters" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">letters</Link>
          <Link to="/account" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">account</Link>
          <Link to="/" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">build yours</Link>
        </div>
      </footer>
    </div>
  );
}