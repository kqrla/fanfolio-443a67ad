const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import { ArrowLeft, Plus, X, Save, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MEDIA_TYPE_LABELS = {
  tv_show: "tv show", movie: "movie", documentary: "documentary",
  book: "book", artist: "music artist", podcast: "podcast",
  video_game: "video game", anime: "anime", fanfiction: "fanfiction", creator: "creator",
};

const URL_TO_MEDIA_TYPE = {
  tv: "tv_show", movie: "movie", documentary: "documentary",
  book: "book", music: "artist", podcast: "podcast",
  game: "video_game", anime: "anime", fanfiction: "fanfiction", creator: "creator",
};

// Media types that support character/ship/fic linking
const NARRATIVE_TYPES = ["tv_show", "movie", "documentary", "anime", "video_game", "book", "fanfiction"];

export function slugify(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Inline editable field row ────────────────────────────────────────────────

// profileItem shape: { id, name, source? (characters), show? (ships), note? }
function LinkedItemsField({ label, items, profileItems, priorityItems, onAdd, onRemove, placeholder, showMeta }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addedNames = items.map((i) => i.name?.toLowerCase());

  // Split suggestions: priority (from this media) vs others
  const filterFn = (p) =>
    !addedNames.includes(p.name?.toLowerCase()) &&
    (!input || p.name?.toLowerCase().includes(input.toLowerCase()));

  const prioritySuggestions = (priorityItems || []).filter(filterFn);
  const otherSuggestions = profileItems.filter(
    (p) => !addedNames.includes(p.name?.toLowerCase()) &&
      !(priorityItems || []).some((pi) => pi.name?.toLowerCase() === p.name?.toLowerCase()) &&
      (!input || p.name?.toLowerCase().includes(input.toLowerCase()))
  );

  const handleAdd = (profileItem) => {
    const name = typeof profileItem === "string" ? profileItem : profileItem.name;
    if (!name?.trim()) return;
    const extra = typeof profileItem === "object"
      ? { source: profileItem.source, show: profileItem.show }
      : {};
    onAdd({ name: name.trim(), id: crypto.randomUUID(), ...extra });
    setInput("");
    setOpen(false);
  };

  const renderSuggestionRow = (s) => (
    <button
      key={s.id || s.name}
      onClick={() => handleAdd(s)}
      className="w-full text-left px-3 py-1.5 font-body text-xs hover:bg-muted transition-colors"
    >
      <span>{s.name}</span>
      {s.source && <span className="font-mono text-[9px] text-muted-foreground ml-1.5">— {s.source}</span>}
      {s.show && <span className="font-mono text-[9px] text-muted-foreground ml-1.5">— {s.show}</span>}
    </button>
  );

  return (
    <div className="flex-1 min-w-0">
      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-sm font-body text-xs"
          >
            <span>{item.name}</span>
            {showMeta && item.source && item.source.toLowerCase() !== showMeta?.toLowerCase() && (
              <span className="font-mono text-[8px] text-muted-foreground">({item.source})</span>
            )}
            {showMeta && item.show && item.show.toLowerCase() !== showMeta?.toLowerCase() && (
              <span className="font-mono text-[8px] text-muted-foreground">({item.show})</span>
            )}
            <button onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive ml-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      {open ? (
        <div className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd(input);
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            className="h-7 text-xs pr-16"
            autoFocus
          />
          <button
            onClick={() => handleAdd(input)}
            className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-primary hover:underline"
          >
            add
          </button>
          {(prioritySuggestions.length > 0 || otherSuggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 z-10 bg-popover border border-border rounded-sm shadow-md mt-0.5 max-h-48 overflow-y-auto">
              {prioritySuggestions.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-0.5 font-mono text-[8px] uppercase tracking-widest text-primary">from this title</p>
                  {prioritySuggestions.map(renderSuggestionRow)}
                </>
              )}
              {otherSuggestions.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">other</p>
                  {otherSuggestions.map(renderSuggestionRow)}
                </>
              )}
            </div>
          )}
          <button
            onClick={() => setOpen(false)}
            className="block font-mono text-[9px] text-muted-foreground hover:text-primary mt-1 transition-colors"
          >
            cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Plus className="w-2.5 h-2.5" /> add
        </button>
      )}
    </div>
  );
}

function PlainTextField({ label, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || "");

  const handleSave = () => {
    onChange(input);
    setOpen(false);
  };

  return (
    <div className="flex-1 min-w-0">
      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">{label}</p>
      {open ? (
        <div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setOpen(false); }}
            placeholder={placeholder}
            className="h-7 text-xs"
            autoFocus
          />
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} className="font-mono text-[9px] text-primary hover:underline">save</button>
            <button onClick={() => setOpen(false)} className="font-mono text-[9px] text-muted-foreground hover:text-primary">cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="font-body text-xs text-left text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {value || <span className="italic">{placeholder}</span>}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaDetailPage() {
  const { id, mediaType: mediaTypeSlug, itemSlug } = useParams();
  const [profile, setProfile] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Auth
  const [editKeyInput, setEditKeyInput] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [keyError, setKeyError] = useState(false);

  // Rich form state
  const [form, setForm] = useState({
    notes: "",
    quote: "",
    rating: "",
    item_tags: "",
    fav_characters: [],   // [{id, name}]
    fav_ships: [],        // [{id, name}]
    fav_fics: [],         // [{id, name}]
    other: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const mediaType = URL_TO_MEDIA_TYPE[mediaTypeSlug];
  const isNarrative = NARRATIVE_TYPES.includes(mediaType);

  // Auto-unlock if edit key is passed via ?key= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) setEditKeyInput(key);
  }, []);

  useEffect(() => { loadProfile(); }, [id, mediaTypeSlug, itemSlug]);

  const loadProfile = async () => {
    let results = await db.entities.FanfolioProfile.filter({ profile_id: id });
    if (results.length === 0) results = await db.entities.FanfolioProfile.filter({ slug: id });
    if (results.length === 0) { setNotFound(true); setLoading(false); return; }

    const prof = results[0];
    setProfile(prof);

    const found = (prof.media_items || []).find(
      (m) => m.media_type === mediaType && slugify(m.title) === itemSlug
    );
    if (!found) { setNotFound(true); setLoading(false); return; }

    setItem(found);
    setForm({
      notes: found.notes || "",
      quote: found.quote || "",
      rating: found.rating || "",
      item_tags: found.item_tags || "",
      fav_characters: found.fav_characters || [],
      fav_ships: found.fav_ships || [],
      fav_fics: found.fav_fics || [],
      other: found.other || "",
    });
    document.title = `${found.title} — ${prof.username || "fanfolio"}`;

    // Auto-unlock if key param matches
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key && key === prof.edit_key) {
      setIsOwner(true);
    }

    setLoading(false);
  };

  const handleUnlock = () => {
    if (editKeyInput.trim() === profile.edit_key) {
      setIsOwner(true); setShowKeyPrompt(false); setKeyError(false);
    } else {
      setKeyError(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedItem = { ...item, ...form };
    const updatedItems = (profile.media_items || []).map((m) =>
      m.id === item.id ? updatedItem : m
    );
    await db.entities.FanfolioProfile.update(profile.id, { media_items: updatedItems });
    setItem(updatedItem);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Linked item helpers
  const addLinkedItem = (field, item) => patchForm({ [field]: [...(form[field] || []), item] });
  const removeLinkedItem = (field, itemId) => patchForm({ [field]: (form[field] || []).filter((x) => x.id !== itemId) });

  // Profile's character list for suggestions
  const profileCharacters = profile?.characters || [];
  const profileShips = profile?.ships || [];

  // Characters/ships whose source/show fuzzy-matches the current media title
  const titleLower = item?.title?.toLowerCase() || "";
  const priorityCharacters = profileCharacters.filter(
    (c) => c.source && c.source.toLowerCase().includes(titleLower.slice(0, 8))
  );
  const priorityShips = profileShips.filter(
    (s) => s.show && s.show.toLowerCase().includes(titleLower.slice(0, 8))
  );

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">404</p>
        <h1 className="font-heading text-4xl font-light">Entry not found.</h1>
        <Link to={`/s/${id}`} className="inline-block mt-8 font-mono text-xs tracking-widest uppercase text-primary hover:underline">
          ← back to archive
        </Link>
      </div>
    </div>
  );

  const tagList = (form.item_tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <Link
          to={`/s/${id}`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {profile?.username || "archive"}
        </Link>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background rounded-sm font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" /> {saving ? "saving..." : saved ? "saved ✓" : "save"}
            </button>
          )}
          {!isOwner && (
            <button
              onClick={() => setShowKeyPrompt(true)}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit2 className="w-3 h-3" /> edit
            </button>
          )}
        </div>
      </div>

      {/* Edit key prompt */}
      {showKeyPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowKeyPrompt(false)}>
          <div className="bg-background border border-border rounded-sm p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-xl font-light mb-4">enter edit key</h3>
            <Input
              type="password"
              value={editKeyInput}
              onChange={(e) => { setEditKeyInput(e.target.value); setKeyError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="paste your edit key"
              className={keyError ? "border-destructive" : ""}
            />
            {keyError && <p className="font-mono text-[10px] text-destructive mt-1">incorrect key.</p>}
            <div className="flex gap-2 mt-3">
              <Button onClick={handleUnlock} size="sm">unlock</Button>
              <button onClick={() => setShowKeyPrompt(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary">cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12">
        {/* Hero */}
        <div className="flex gap-8 mb-12">
          {item.image_url && (
            <div className="flex-shrink-0 w-32 md:w-40 aspect-[2/3] overflow-hidden rounded-sm bg-muted">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 pt-2">
            <p className="font-mono text-[9px] tracking-widest uppercase text-primary mb-2">
              {MEDIA_TYPE_LABELS[mediaType] || mediaType}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-light tracking-tight leading-none mb-2">
              {item.title}
            </h1>
            {item.subtitle && (
              <p className="font-mono text-xs text-muted-foreground mb-3">{item.subtitle}</p>
            )}
            {/* Rating */}
            {isOwner ? (
              <Input
                value={form.rating}
                onChange={(e) => patchForm({ rating: e.target.value })}
                placeholder="rating — e.g. ★★★★★ or 9/10"
                className="h-7 text-xs w-52 mt-1"
              />
            ) : (
              item.rating && <p className="font-mono text-sm text-primary">{item.rating}</p>
            )}
          </div>
        </div>

        {/* ── Details block (characters, ships, fics, other) ── */}
        {isNarrative && (
          <div className="border border-border rounded-sm mb-6 overflow-hidden">
            <button
              onClick={() => setDetailsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-mono text-[10px] tracking-widest uppercase text-foreground">show details</span>
              {detailsOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {detailsOpen && (
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                  {/* FAV CHARACTERS */}
                  {isOwner ? (
                    <LinkedItemsField
                      label="fav characters"
                      items={form.fav_characters}
                      profileItems={profileCharacters}
                      priorityItems={priorityCharacters}
                      showMeta={item.title}
                      onAdd={(c) => addLinkedItem("fav_characters", c)}
                      onRemove={(cid) => removeLinkedItem("fav_characters", cid)}
                      placeholder="character name..."
                    />
                  ) : (
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">fav characters</p>
                      {form.fav_characters.length > 0
                        ? form.fav_characters.map((c) => (
                            <p key={c.id} className="font-body text-xs mb-1">
                              {c.name}
                              {c.source && c.source.toLowerCase() !== titleLower && (
                                <span className="font-mono text-[8px] text-muted-foreground ml-1">({c.source})</span>
                              )}
                            </p>
                          ))
                        : <p className="font-body text-xs text-muted-foreground italic">—</p>}
                    </div>
                  )}

                  {/* FAV SHIPS */}
                  {isOwner ? (
                    <LinkedItemsField
                      label="fav ships"
                      items={form.fav_ships}
                      profileItems={profileShips}
                      priorityItems={priorityShips}
                      showMeta={item.title}
                      onAdd={(s) => addLinkedItem("fav_ships", s)}
                      onRemove={(sid) => removeLinkedItem("fav_ships", sid)}
                      placeholder="ship name..."
                    />
                  ) : (
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">fav ships</p>
                      {form.fav_ships.length > 0
                        ? form.fav_ships.map((s) => (
                            <p key={s.id} className="font-body text-xs mb-1">
                              {s.name}
                              {s.show && s.show.toLowerCase() !== titleLower && (
                                <span className="font-mono text-[8px] text-muted-foreground ml-1">({s.show})</span>
                              )}
                            </p>
                          ))
                        : <p className="font-body text-xs text-muted-foreground italic">—</p>}
                    </div>
                  )}

                  {/* FAV FICS */}
                  {isOwner ? (
                    <LinkedItemsField
                      label="fav fics"
                      items={form.fav_fics}
                      profileItems={[]}
                      onAdd={(f) => addLinkedItem("fav_fics", f)}
                      onRemove={(fid) => removeLinkedItem("fav_fics", fid)}
                      placeholder="fic title or ao3 link..."
                    />
                  ) : (
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">fav fics</p>
                      {form.fav_fics.length > 0
                        ? form.fav_fics.map((f) => <p key={f.id} className="font-body text-xs mb-1">{f.name}</p>)
                        : <p className="font-body text-xs text-muted-foreground italic">—</p>}
                    </div>
                  )}

                  {/* OTHER */}
                  {isOwner ? (
                    <PlainTextField
                      label="other"
                      value={form.other}
                      onChange={(v) => patchForm({ other: v })}
                      placeholder="Type here..."
                    />
                  ) : (
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">other</p>
                      <p className="font-body text-xs text-muted-foreground">{form.other || <span className="italic">—</span>}</p>
                    </div>
                  )}
                </div>

                {/* Tags row */}
                {isOwner && (
                  <div className="pt-4 border-t border-border">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">tags (comma-separated)</label>
                    <Input
                      value={form.item_tags}
                      onChange={(e) => patchForm({ item_tags: e.target.value })}
                      placeholder="slow burn, found family, hurt/comfort"
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                )}
                {!isOwner && tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                    {tagList.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted rounded-full font-mono text-[9px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Quote ── */}
        <div className="mb-6">
          {isOwner ? (
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">favourite quote</label>
              <Input
                value={form.quote}
                onChange={(e) => patchForm({ quote: e.target.value })}
                placeholder="a memorable line..."
                className="mt-1"
              />
            </div>
          ) : (
            form.quote && (
              <blockquote className="border-l-2 border-primary pl-5 font-heading italic text-xl md:text-2xl leading-relaxed">
                "{form.quote}"
              </blockquote>
            )
          )}
        </div>

        {/* ── Rich text notes ── */}
        <div className="mb-8">
          {isOwner ? (
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-2">notes</label>
              <Textarea
                value={form.notes}
                onChange={(e) => patchForm({ notes: e.target.value })}
                placeholder="Start writing here..."
                rows={10}
                className="text-sm font-body leading-relaxed"
              />
            </div>
          ) : (
            form.notes && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{form.notes}</p>
            )
          )}
        </div>

        {/* ── Empty state ── */}
        {!isOwner && !form.notes && !form.quote && tagList.length === 0 &&
          form.fav_characters.length === 0 && form.fav_ships.length === 0 && form.fav_fics.length === 0 && (
          <p className="font-mono text-[11px] text-muted-foreground">no notes added yet.</p>
        )}
      </div>
    </div>
  );
}