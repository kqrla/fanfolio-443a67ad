const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { X, Maximize2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

// Map media_type to URL segment
const MEDIA_TYPE_TO_URL = {
  tv_show: "tv", movie: "movie", documentary: "documentary",
  book: "book", artist: "music", podcast: "podcast",
  video_game: "game", anime: "anime", fanfiction: "fanfiction", creator: "creator",
};

function slugify(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function MediaModal({ item, isOwner, onClose, onSave, profileId, editKey }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: item?.title || "",
    subtitle: item?.subtitle || "",
    image_url: item?.image_url || "",
    link: item?.link || "",
    notes: item?.notes || "",
    quote: item?.quote || "",
    rating: item?.rating || "",
    item_tags: item?.item_tags || "",
  });
  const [uploading, setUploading] = useState(false);

  if (!item) return null;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSave = () => {
    onSave?.({ ...item, ...form });
    setEditing(false);
  };

  const displayItem = editing ? { ...item, ...form } : item;
  const tagList = (displayItem.item_tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  const mediaUrlType = MEDIA_TYPE_TO_URL[item.media_type];
  const expandUrl = profileId && mediaUrlType
    ? `/s/${profileId}/${mediaUrlType}/${slugify(item.title)}${editKey ? `?key=${editKey}` : ""}`
    : null;

  const showLink = item.media_type === "fanfiction" || item.media_type === "creator";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-md bg-background border border-border rounded-sm overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex gap-5 p-6 pb-4">
            {/* Cover image */}
            <div className="w-20 flex-shrink-0">
              <div className="aspect-[2/3] overflow-hidden rounded-sm bg-muted relative group/cover">
                {form.image_url
                  ? <img src={form.image_url} alt={displayItem.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">no image</div>
                }
                {isOwner && editing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-opacity">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              {isOwner && editing && (
                <label className="mt-1.5 flex items-center justify-center gap-1 cursor-pointer font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                  <Upload className="w-2.5 h-2.5" />
                  {uploading ? "uploading..." : "change"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">
                {item.media_type?.replace(/_/g, " ")}
              </p>
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="title"
                    className="h-8 text-sm font-heading"
                  />
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    placeholder="author / creator / subtitle"
                    className="h-7 text-xs"
                  />
                  {showLink && (
                    <Input
                      value={form.link}
                      onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                      placeholder="link url (ao3, youtube, etc.)"
                      className="h-7 text-xs"
                    />
                  )}
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-2xl font-light leading-tight">{displayItem.title}</h3>
                  {displayItem.subtitle && <p className="font-mono text-xs text-muted-foreground mt-1">{displayItem.subtitle}</p>}
                  {displayItem.rating && <p className="font-mono text-xs text-primary mt-2">{displayItem.rating}</p>}
                </>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {expandUrl && (
                <Link
                  to={expandUrl}
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-sm border border-border hover:border-primary hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                  title="open full page"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-3 overflow-y-auto">
            {editing ? (
              <>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">rating</label>
                  <Input
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    className="mt-1 text-sm"
                    placeholder="e.g. ★★★★★ or 9/10"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">quote</label>
                  <Input
                    value={form.quote}
                    onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                    className="mt-1 text-sm"
                    placeholder="a memorable line..."
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">notes</label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="mt-1 text-sm"
                    placeholder="your thoughts..."
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">tags (comma-separated)</label>
                  <Input
                    value={form.item_tags}
                    onChange={(e) => setForm((f) => ({ ...f, item_tags: e.target.value }))}
                    className="mt-1 text-sm"
                    placeholder="drama, slow burn, cathartic"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} size="sm" className="h-7 text-xs">save</Button>
                  <button
                    onClick={() => setEditing(false)}
                    className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {displayItem.notes && (
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-4">{displayItem.notes}</p>
                )}
                {displayItem.quote && (
                  <blockquote className="border-l-2 border-primary pl-3 font-heading italic text-base">
                    "{displayItem.quote}"
                  </blockquote>
                )}
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagList.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted rounded-full font-mono text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 pt-1">
                  {isOwner && (
                    <button
                      onClick={() => setEditing(true)}
                      className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                    >
                      edit
                    </button>
                  )}
                  {expandUrl && (
                    <Link
                      to={expandUrl}
                      onClick={onClose}
                      className="font-mono text-[10px] uppercase tracking-wider text-primary hover:underline transition-colors flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" /> {isOwner ? "edit full page" : "full page"}
                    </Link>
                  )}
                </div>
                {!displayItem.notes && !displayItem.quote && tagList.length === 0 && !isOwner && (
                  <p className="font-mono text-[10px] text-muted-foreground">no notes added yet</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}