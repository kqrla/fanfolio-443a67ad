import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESET_SPACES = [
  "booktwt", "filmtwt", "stantwt", "langtwt", "studytwt",
  "animetwt", "kpoptwt", "gametwt", "writetwt", "arttwt",
  "musictwt", "comicstwt", "theatertwt", "podcasttwt", "literarytwt",
];

function FandomSpaceBadge({ space, isOwner, onDelete }) {
  return (
    <div className="relative group">
      <span className="px-3 py-1.5 border border-border rounded-full font-mono text-[11px] tracking-wider text-muted-foreground flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors">
        #{space}
      </span>
      {isOwner && (
        <button
          onClick={() => onDelete(space)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

export default function FandomsSection({ fandoms = [], fandomSpaces = [], isOwner, onAddFandom, onDeleteFandom, onAddSpace, onDeleteSpace, inFormBuilder = false }) {
  const [addingFandom, setAddingFandom] = useState(false);
  const [addingSpace, setAddingSpace] = useState(false);
  const [fandomForm, setFandomForm] = useState({ name: "", note: "" });
  const [spaceInput, setSpaceInput] = useState("");

  if (fandoms.length === 0 && fandomSpaces.length === 0 && !isOwner) return null;

  const handleAddFandom = () => {
    if (!fandomForm.name.trim()) return;
    onAddFandom?.({ ...fandomForm, id: crypto.randomUUID() });
    setFandomForm({ name: "", note: "" });
    setAddingFandom(false);
  };

  const handleAddSpace = (space) => {
    const cleaned = space.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleaned || fandomSpaces.includes(cleaned)) return;
    onAddSpace?.(cleaned);
    setSpaceInput("");
    setAddingSpace(false);
  };

  const inner = (
    <div>
        {/* Fandoms */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight">fandoms</h2>
              <div className="h-px w-16 bg-primary mt-3" />
            </div>
            {isOwner && (
              <button
                onClick={() => setAddingFandom(!addingFandom)}
                className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> add
              </button>
            )}
          </div>

          {addingFandom && isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-muted rounded-sm flex flex-wrap gap-3 items-end"
            >
              <div className="flex-1 min-w-[160px]">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">fandom name *</label>
                <Input
                  value={fandomForm.name}
                  onChange={(e) => setFandomForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFandom()}
                  placeholder="e.g. jujutsu kaisen"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">note (optional)</label>
                <Input
                  value={fandomForm.note}
                  onChange={(e) => setFandomForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. since 2020, casual"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={handleAddFandom} size="sm" className="h-7 text-xs" disabled={!fandomForm.name.trim()}>add</Button>
                <button onClick={() => setAddingFandom(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
              </div>
            </motion.div>
          )}

          {fandoms.length > 0 ? (
            <div className="space-y-3">
              {fandoms.map((fandom, i) => (
                <motion.div
                  key={fandom.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-body text-base">{fandom.name}</span>
                    {fandom.note && (
                      <span className="font-mono text-[11px] text-muted-foreground ml-2">- {fandom.note}</span>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => onDeleteFandom?.(fandom.id)}
                      className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : isOwner ? (
            <p className="font-mono text-xs text-muted-foreground tracking-wider">no fandoms added yet</p>
          ) : null}
        </div>

        {/* Fandom Spaces */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="font-heading text-2xl font-light tracking-tight">fandom spaces</h3>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">communities i exist in online</p>
            </div>
            {isOwner && (
              <button
                onClick={() => setAddingSpace(!addingSpace)}
                className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> add
              </button>
            )}
          </div>

          {addingSpace && isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 space-y-3"
            >
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">custom space</label>
                  <Input
                    value={spaceInput}
                    onChange={(e) => setSpaceInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSpace(spaceInput)}
                    placeholder="e.g. booktwt"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <Button onClick={() => handleAddSpace(spaceInput)} size="sm" className="h-7 text-xs" disabled={!spaceInput.trim()}>add</Button>
                <button onClick={() => setAddingSpace(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">or pick a preset</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SPACES.filter((s) => !fandomSpaces.includes(s)).map((space) => (
                    <button
                      key={space}
                      onClick={() => handleAddSpace(space)}
                      className="px-3 py-1 border border-border rounded-full font-mono text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      #{space}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {fandomSpaces.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fandomSpaces.map((space) => (
                <FandomSpaceBadge key={space} space={space} isOwner={isOwner} onDelete={onDeleteSpace} />
              ))}
            </div>
          ) : isOwner ? (
            <p className="font-mono text-xs text-muted-foreground tracking-wider">no spaces added yet</p>
          ) : null}
        </div>

        {!inFormBuilder && <div className="h-px bg-border mt-12 md:mt-20" />}
      </div>
  );

  if (inFormBuilder) return inner;
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">{inner}</div>
    </section>
  );
}