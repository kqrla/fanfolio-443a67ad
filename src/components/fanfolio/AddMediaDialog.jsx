const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function AddMediaDialog({ open, onOpenChange, mediaType, onAdd }) {
  const [form, setForm] = useState({ title: "", subtitle: "", link: "", image_url: "", notes: "", creator_type: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCreator = mediaType === "creator";
  const showLink = mediaType === "fanfiction" || isCreator;
  const subtitleLabel = isCreator ? "platform" : "subtitle (author / creator)";
  const subtitlePlaceholder = isCreator ? "youtube, twitch, etc." : "optional";
  const linkLabel = isCreator ? "profile url" : "ao3 link";
  const linkPlaceholder = isCreator ? "https://youtube.com/@..." : "https://archiveofourown.org/...";

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onAdd?.({ ...form, media_type: mediaType, id: crypto.randomUUID() });
    setForm({ title: "", subtitle: "", link: "", image_url: "", notes: "" });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-light">add item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">cover image</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="mt-1" />
            {uploading && <p className="text-xs text-muted-foreground mt-1">uploading...</p>}
            {form.image_url && (
              <img src={form.image_url} alt="preview" className="mt-2 w-16 h-24 object-cover rounded-sm" />
            )}
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1"
              placeholder="title"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{subtitleLabel}</label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              className="mt-1"
              placeholder={subtitlePlaceholder}
            />
          </div>
          {isCreator && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">creator type</label>
              <select
                value={form.creator_type}
                onChange={(e) => setForm((f) => ({ ...f, creator_type: e.target.value }))}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">select type...</option>
                <option value="streamer">streamer</option>
                <option value="influencer">influencer</option>
                <option value="comedian">comedian</option>
                <option value="educator">educator</option>
                <option value="musician">musician</option>
                <option value="podcaster">podcaster</option>
                <option value="artist">artist</option>
                <option value="writer">writer</option>
                <option value="filmmaker">filmmaker</option>
                <option value="other">other</option>
              </select>
            </div>
          )}
          {showLink && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{linkLabel}</label>
              <Input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="mt-1"
                placeholder={linkPlaceholder}
              />
            </div>
          )}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">notes (optional)</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1"
              placeholder="your thoughts on this one..."
              rows={2}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="w-full">
            {saving ? "adding..." : "add to collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}