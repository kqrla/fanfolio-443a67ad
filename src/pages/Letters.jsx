import { Link } from "react-router-dom";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";
import ReactMarkdown from "react-markdown";

// ── Edit your letter here ────────────────────────────────────────────────────
// Paste your markdown content directly into this string.
// Supports headings, bold, italic, blockquotes, line breaks, horizontal rules.

const LETTER = `
# a letter from the creator
_a message_
---

people visit museums to experience the past. to stand before artifacts, read the placards, and understand what came before them. some people think museums are dull, only rooms full of things that no longer matter. but museums are never just about the past.

a museum teaches you what was cherished, what was lost, what was survived. you leave carrying something with you, even though nothing was taken from the walls.

> "we are all just museum of everything we've ever loved."

each of us keeps different collections. different wings. different exhibits. some are bright and obvious, proudly displayed. others sit quietly in storage, tucked away but still ours. if you walked through your own halls, you would find the songs that once knew you by heart, the stories that raised you, the characters who understood you before anyone else did, the eras of your life marked by playlists, fandoms, games, books, and names you thought you had forgotten.

the things we love do not disappear just because we outgrow them. maybe you no longer follow the band. maybe the show ended years ago. maybe the phase passed so completely that it feels like it belonged to someone else. and still, somewhere inside you, it remains. a preserved fragment. a memory with its colors intact.

you are the curator of this museum. you decide what stays on display. what gets carefully archived. what deserves restoration. what can be packed away without resentment. you are allowed to rearrange the rooms. you are allowed to revisit old wings. you are allowed to close doors and open new ones.

> "i am a museum of everything and a mosaic of everyone i have ever loved, even for a heartbeat."

not only in metaphor, but in truth. every version of me still exists somewhere in the exhibits. every obsession, every season, every friendship, every song played too many times, every late-night fixation, every world that once felt more real than this one. i may not always show it, but i carry all of it.

when i walk through my own museum, i feel gratitude. for the things that shaped me. for the people who passed through. for the memories that stayed. even the rooms i no longer visit helped build the foundation of the place.

the doors are open. anyone can look back through old photos, messages, lists, scraps, and echoes. but the person who once stood there has already moved forward. that is what museums are for: to honor what was, without pretending it is still now.

and one day, there will be new wings. brighter rooms. bigger stories. fresh collections still waiting to be named. the old halls will remain, steady and beloved, while newer memories begin to shine beside them. the past still has a place here.
in my heart, in my history, and on fanfolio.


`;

// ────────────────────────────────────────────────────────────────────────────

export default function Letters() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <Link to="/landing" className="font-mono text-[11px] tracking-widest uppercase text-primary">
            fanfolio
          </Link>
          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">by ocverse</span>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link
            to="/landing"
            className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            home
          </Link>
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
          <span className="h-px w-8 bg-primary inline-block" />a letter
        </p>

        <div
          className="
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
        "
        >
          <ReactMarkdown>{LETTER.trim()}</ReactMarkdown>
        </div>
      </div>

      <footer className="border-t border-border px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">fanfolio</span>
          <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground/60">by ocverse</span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          <a href="mailto:support@ocverse.site" className="hover:text-primary transition-colors">
            support@ocverse.site
          </a>
        </p>
      </footer>
    </div>
  );
}
