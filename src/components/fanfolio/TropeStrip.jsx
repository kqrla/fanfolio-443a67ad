import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function TropeStrip({ tags, isOwner, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", tag_type: "trope" });

  if (tags.length === 0 && !isOwner) return null;

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await onAdd?.(form);
    setForm({ name: "", tag_type: "trope" });
    setAdding(false);
  };

  const doubledTags = [...tags, ...tags];

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight">tropes & tags</h2>
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
            className="mt-6 p-4 bg-muted rounded-sm flex flex-wrap gap-3 items-end"
          >
            <div className="flex-1 min-w-[140px]">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">tag</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. enemies to lovers"
                className="mt-1"
              />
            </div>
            <div className="w-36">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">type</label>
              <Select value={form.tag_type} onValueChange={(v) => setForm((f) => ({ ...f, tag_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trope">trope</SelectItem>
                  <SelectItem value="genre">genre</SelectItem>
                  <SelectItem value="ao3">ao3 tag</SelectItem>
                  <SelectItem value="arc">arc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} size="sm" disabled={!form.name.trim()}>save</Button>
          </motion.div>
        )}
      </div>

      {tags.length > 0 ? (
        <div className="overflow-hidden w-full">
          <div className={`flex gap-4 w-max ${tags.length >= 4 ? "animate-marquee" : ""}`}>
            {(tags.length >= 4 ? doubledTags : tags).map((tag, i) => (
              <div
                key={`${tag.id}-${i}`}
                className="group relative flex-shrink-0 px-5 py-2.5 border border-border rounded-full font-body text-sm text-foreground hover:border-primary hover:text-primary transition-colors cursor-default whitespace-nowrap"
              >
                {tag.name}
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground ml-2 opacity-60">
                  {tag.tag_type}
                </span>
                {isOwner && i < tags.length && (
                  <button
                    onClick={() => onDelete?.(tag.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <p className="font-mono text-xs text-muted-foreground tracking-wider py-6">no tags added yet</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="h-px bg-border" />
      </div>
    </section>
  );
}