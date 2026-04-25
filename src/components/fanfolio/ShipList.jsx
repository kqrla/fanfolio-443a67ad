import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Ship detail popup ────────────────────────────────────────────────────────

function ShipDetailModal({ ship, onClose }) {
  if (!ship) return null;

  const tropeList = ship.tropes
    ? (Array.isArray(ship.tropes) ? ship.tropes : ship.tropes.split(",").map((t) => t.trim())).filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-sm p-6 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-2xl font-light">{ship.name}</h3>
            {ship.show && (
              <p className="font-mono text-xs text-muted-foreground mt-1">from {ship.show}</p>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {ship.ship_characters && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">characters</p>
              <p className="font-body text-sm">{ship.ship_characters}</p>
            </div>
          )}

          {tropeList.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">tropes</p>
              <div className="flex flex-wrap gap-1.5">
                {tropeList.map((trope, i) => (
                  <span key={i} className="px-2.5 py-1 border border-border rounded-full font-mono text-[10px] text-foreground">
                    {trope}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ship.note && (
            <p className="font-body text-sm text-muted-foreground italic">"{ship.note}"</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShipList({ ships, isOwner, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [selectedShip, setSelectedShip] = useState(null);
  const [form, setForm] = useState({ name: "", show: "", ship_characters: "", tropes: "", note: "" });

  if (ships.length === 0 && !isOwner) return null;

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await onAdd?.({ ...form });
    setForm({ name: "", show: "", ship_characters: "", tropes: "", note: "" });
    setAdding(false);
  };

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight">favorite ships</h2>
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
            className="mb-8 p-4 bg-muted rounded-sm space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">ship name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. steve × bucky"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">source</label>
                <Input
                  value={form.show}
                  onChange={(e) => setForm((f) => ({ ...f, show: e.target.value }))}
                  placeholder="e.g. the mcu"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">characters</label>
              <Input
                value={form.ship_characters}
                onChange={(e) => setForm((f) => ({ ...f, ship_characters: e.target.value }))}
                placeholder="e.g. steve rogers, bucky barnes"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">tropes (comma-separated)</label>
              <Input
                value={form.tropes}
                onChange={(e) => setForm((f) => ({ ...f, tropes: e.target.value }))}
                placeholder="e.g. enemies to lovers, slow burn"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">note</label>
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="optional short note"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="h-7 text-xs" disabled={!form.name.trim()}>save</Button>
              <button onClick={() => setAdding(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {ships.map((ship, i) => (
            <motion.div
              key={ship.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <button
                onClick={() => setSelectedShip(ship)}
                className="flex-1 text-left hover:text-primary transition-colors"
              >
                <span className="font-body text-base">{ship.name}</span>
                {ship.show && (
                  <span className="font-mono text-[11px] text-muted-foreground ml-2">- {ship.show}</span>
                )}
              </button>
              {isOwner && (
                <button
                  onClick={() => onDelete?.(ship.id)}
                  className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
          {ships.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground tracking-wider py-6">no ships added yet</p>
          )}
        </div>

        <div className="h-px bg-border mt-12 md:mt-20" />
      </div>

      <ShipDetailModal ship={selectedShip} onClose={() => setSelectedShip(null)} />
    </section>
  );
}