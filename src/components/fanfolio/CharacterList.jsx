import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CharacterList({ characters, isOwner, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", source: "" });

  if (characters.length === 0 && !isOwner) return null;

  const handleAdd = async () => {
    if (!form.name.trim() || !form.source.trim()) return;
    await onAdd?.(form);
    setForm({ name: "", source: "" });
    setAdding(false);
  };

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight">favorite characters</h2>
            <div className="h-px w-16 bg-primary mt-3" />
          </div>
          {isOwner && (
            <button
              onClick={() => setAdding(!adding)}
              className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> add
            </button>
          )}
        </div>

        {adding && isOwner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 p-4 bg-muted rounded-sm flex flex-wrap gap-3 items-end"
          >
            <div className="flex-1 min-w-[140px]">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. gojo satoru"
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">source</label>
              <Input
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                placeholder="e.g. jujutsu kaisen"
                className="mt-1"
              />
            </div>
            <Button onClick={handleAdd} size="sm" disabled={!form.name.trim() || !form.source.trim()}>save</Button>
          </motion.div>
        )}

        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap gap-3">
            {characters.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative group"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-5 py-2.5 border border-border rounded-sm cursor-default hover:border-primary hover:text-primary transition-colors font-body text-sm select-none">
                      {char.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-foreground text-background font-mono text-xs tracking-wide px-3 py-1.5">
                    from {char.source}
                  </TooltipContent>
                </Tooltip>
                {isOwner && (
                  <button
                    onClick={() => onDelete?.(char.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </motion.div>
            ))}
            {characters.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground tracking-wider py-6">no characters added yet</p>
            )}
          </div>
        </TooltipProvider>

        <div className="h-px bg-border mt-12 md:mt-20" />
      </div>
    </section>
  );
}