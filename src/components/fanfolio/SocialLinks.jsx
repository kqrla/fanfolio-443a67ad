import { useState } from "react";
import { Plus, X, Globe, Music, Coffee, ShoppingBag, Film, Monitor, BookOpen, Hash, Cloud, Palette, Link, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

const PLATFORM_CONFIG = {
  letterboxd:  { label: "letterboxd",  icon: Film       },
  serializd:   { label: "serializd",   icon: Monitor    },
  musicboard:  { label: "musicboard",  icon: Music      },
  twitter:     { label: "twitter",     icon: Hash       },
  bluesky:     { label: "bluesky",     icon: Cloud      },
  mastodon:    { label: "mastodon",    icon: Globe      },
  reddit:      { label: "reddit",      icon: Hash       },
  ao3:         { label: "ao3",         icon: BookOpen   },
  kofi:        { label: "ko-fi",       icon: Coffee     },
  spotify:     { label: "spotify",     icon: Music      },
  gumroad:     { label: "gumroad",     icon: ShoppingBag },
  vgen:        { label: "vgen",        icon: Palette    },
  website:     { label: "website",     icon: Globe      },
  store:       { label: "store",       icon: ShoppingBag },
  email:       { label: "email",       icon: Mail       },
};

function resolveUrl(platform, rawUrl) {
  if (platform === "email") {
    if (rawUrl.startsWith("mailto:")) return rawUrl;
    return `mailto:${rawUrl}`;
  }
  return rawUrl;
}

function PlatformIcon({ link, isOwner, onDelete }) {
  const config = PLATFORM_CONFIG[link.platform] || { label: link.platform, icon: Link };
  const Icon = config.icon || Link;
  const href = resolveUrl(link.platform, link.url);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group">
            <a
              href={href}
              target={link.platform === "email" ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-border rounded-sm hover:border-primary hover:text-primary transition-colors text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
            </a>
            {isOwner && (
              <button
                onClick={() => onDelete?.(link.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-mono text-xs">{config.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function SocialLinks({ links = [], isOwner, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ platform: "website", url: "" });

  if (links.length === 0 && !isOwner) return null;

  const isEmail = form.platform === "email";

  const handleAdd = () => {
    if (!form.url.trim()) return;
    onAdd?.({ ...form, id: crypto.randomUUID() });
    setForm({ platform: "website", url: "" });
    setAdding(false);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">find me elsewhere</p>
          {isOwner && (
            <button
              onClick={() => setAdding(!adding)}
              className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> add link
            </button>
          )}
        </div>

        {adding && isOwner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-muted rounded-sm flex flex-wrap gap-3 items-end"
          >
            <div className="w-40">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">platform</label>
              <Select value={form.platform} onValueChange={(v) => setForm({ platform: v, url: "" })}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {isEmail ? "email address" : "url"}
              </label>
              <Input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder={isEmail ? "you@example.com" : "https://..."}
                type={isEmail ? "email" : "url"}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Button onClick={handleAdd} size="sm" className="h-7 text-xs" disabled={!form.url.trim()}>add</Button>
              <button
                onClick={() => setAdding(false)}
                className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                cancel
              </button>
            </div>
          </motion.div>
        )}

        {links.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <PlatformIcon key={link.id} link={link} isOwner={isOwner} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          isOwner && <p className="font-mono text-xs text-muted-foreground">no links added yet</p>
        )}
      </div>
    </section>
  );
}