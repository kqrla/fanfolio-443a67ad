const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

import { Camera, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HeroMasthead({ user, onUserUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "", tagline: "", avatar_url: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        bio: user.bio || "",
        tagline: user.tagline || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await db.auth.updateMe(form);
    onUserUpdate?.();
    setSaving(false);
    setEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, avatar_url: file_url }));
    setUploading(false);
  };

  const displayName = form.username || user?.full_name || "Your Name";

  return (
    <section className="min-h-[65vh] flex items-end pb-16 md:pb-24 relative pt-16">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-36 h-52 md:w-48 md:h-68 overflow-hidden rounded-sm bg-muted">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 pt-2">
            <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-3">
              fanfolio
            </p>
            <h1 className="font-heading font-light tracking-tight leading-none text-foreground"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
              {displayName}
            </h1>
            {form.tagline && (
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mt-5">
                {form.tagline}
              </p>
            )}
            {form.bio && (
              <p className="font-body text-base md:text-lg text-muted-foreground mt-5 max-w-lg leading-relaxed">
                {form.bio}
              </p>
            )}

            <Dialog open={editing} onOpenChange={setEditing}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-6 text-[11px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary px-0"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border-border">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl font-light">Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Avatar</label>
                    <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="mt-1" />
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Display Name</label>
                    <Input
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      className="mt-1"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tagline</label>
                    <Input
                      value={form.tagline}
                      onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g. professional overthinker, fandom historian"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Bio</label>
                    <Textarea
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      className="mt-1"
                      placeholder="Tell the world about your taste"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-border" />
    </section>
  );
}