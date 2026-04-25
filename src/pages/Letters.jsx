import { Link } from "react-router-dom";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";
import ReactMarkdown from "react-markdown";

// ── Edit your letter here ────────────────────────────────────────────────────
// Paste your markdown content directly into this string.
// Supports headings, bold, italic, blockquotes, line breaks, horizontal rules.

const LETTER = `
# a letter to you

*paste your letter here.*

---

this page will render whatever you write here. markdown is fully supported - headings, italics, blockquotes, line breaks, everything.

> "we are all just museums of everything we've ever loved."

replace this content with your own words.
`;

// ────────────────────────────────────────────────────────────────────────────

export default function Letters() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <Link to="/landing" className="font-mono text-[11px] tracking-widest uppercase text-primary">fanfolio</Link>
          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">by ocverse</span>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link to="/landing" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">home</Link>
          <Link
            to="/"
            className="px-5 py-2 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
          >
            build yours
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-10 flex items-center gap-3">
          <span className="h-px w-8 bg-primary inline-block" />
          a letter
        </p>

        <div className="
          font-body text-foreground leading-relaxed
          [&>p]:mb-6 [&>p]:text-base [&>p]:leading-relaxed
          [&>h1]:font-heading [&>h1]:font-light [&>h1]:text-4xl [&>h1]:mb-6 [&>h1]:tracking-tight
          [&>h2]:font-heading [&>h2]:font-light [&>h2]:text-2xl [&>h2]:mb-4
          [&>h3]:font-heading [&>h3]:font-light [&>h3]:text-xl [&>h3]:mb-3
          [&>blockquote]:border-l-2 [&>blockquote]:border-primary [&>blockquote]:pl-5 [&>blockquote]:font-heading [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:text-muted-foreground [&>blockquote]:my-6
          [&>hr]:border-border [&>hr]:my-10
          [&>ul]:space-y-1 [&>ul]:list-none
          [&>ul>li]:font-body [&>ul>li]:text-sm [&>ul>li]:text-muted-foreground
          [&>strong]:font-medium [&>em]:italic
        ">
          <ReactMarkdown>{LETTER.trim()}</ReactMarkdown>
        </div>
      </div>

      <footer className="border-t border-border px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">fanfolio</span>
          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground/60">by ocverse</span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          <a href="mailto:support@ocverse.site" className="hover:text-primary transition-colors">support@ocverse.site</a>
        </p>
      </footer>
    </div>
  );
}