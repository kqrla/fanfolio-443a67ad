const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { ArrowLeft, Settings, X, Upload, Plus, User } from "lucide-react";
import ProfileDisplayView from "./ProfileDisplayView";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import DarkModeToggle from "./DarkModeToggle";

// ─── All available sections ────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { key: "tv_show",      label: "tv shows" },
  { key: "movie",        label: "movies" },
  { key: "documentary",  label: "documentaries" },
  { key: "book",         label: "books" },
  { key: "artist",       label: "artists" },
  { key: "podcast",      label: "podcasts" },
  { key: "video_game",   label: "video games" },
  { key: "anime",        label: "anime" },
  { key: "fanfiction",   label: "fanfiction" },
  { key: "creator",      label: "creators" },
  { key: "fandoms",      label: "fandoms" },
  { key: "characters",   label: "characters" },
  { key: "ships",        label: "ships" },
  { key: "tags",         label: "tropes & tags" },
  { key: "social_links", label: "social links" },
];

// ─── Profile Settings Modal ────────────────────────────────────────────────────
function ProfileSettingsModal({ localProfile, onSave, onClose }) {
  const [form, setForm] = useState({
    username: localProfile.username || "",
    tagline: localProfile.tagline || "",
    bio: localProfile.bio || "",
    avatar_url: localProfile.avatar_url || "",
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, avatar_url: file_url }));
    setUploading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background border border-border rounded-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-light">profile info</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">display name</label>
          <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="your name" className="mt-1" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">tagline</label>
          <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="e.g. professional overthinker" className="mt-1" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="a few words about your taste" rows={3} className="mt-1" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">avatar</label>
          <div className="mt-1 flex items-center gap-3">
            {form.avatar_url && <img src={form.avatar_url} alt="avatar" className="w-10 h-14 object-cover rounded-sm" />}
            <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border border-border rounded-sm px-3 py-2">
              <Upload className="w-3 h-3" />
              {uploading ? "uploading..." : form.avatar_url ? "change" : "upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <button
          onClick={() => { onSave(form); onClose(); }}
          className="w-full py-2.5 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
        >
          apply changes
        </button>
      </div>
    </div>
  );
}

// ─── Section Manager Bar ───────────────────────────────────────────────────────
function SectionManagerBar({ enabledSections, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
      >
        <Plus className="w-3 h-3" /> sections
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5">
          {ALL_SECTIONS.map((s) => {
            const active = enabledSections.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => onToggle(s.key)}
                className={`px-2.5 py-1 rounded-full font-mono text-[9px] tracking-wider uppercase border transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {active ? "✓ " : "+ "}{s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CreatorVisualEditor({
  profileData,
  onProfileDataChange,
  selectedSections,
  onSectionsChange,
  onBack,
  onPublish,
  publishing,
  publishLabel,
  backLabel,
  extraActions,
  onSettingsClick,
  onProfileClick,
  editKey,
}) {
  const [localProfile, setLocalProfile] = useState({
    ...profileData,
    enabled_sections: selectedSections,
  });
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const update = (patch) => {
    setLocalProfile((prev) => {
      const next = { ...prev, ...patch };
      onProfileDataChange({
        username: next.username,
        bio: next.bio,
        tagline: next.tagline,
        avatar_url: next.avatar_url,
        media_items: next.media_items || [],
        characters: next.characters || [],
        ships: next.ships || [],
        tags: next.tags || [],
        social_links: next.social_links || [],
        fandoms: next.fandoms || [],
        fandom_spaces: next.fandom_spaces || [],
      });
      onSectionsChange(next.enabled_sections || []);
      return next;
    });
  };

  const handleToggleSection = (key) => {
    const current = localProfile.enabled_sections || [];
    const next = current.includes(key)
      ? current.filter((s) => s !== key)
      : [...current, key];
    update({ enabled_sections: next });
  };

  const handleProfileSettingsSave = (form) => {
    update(form);
  };

  const handleSaveMedia = (action, payload) => {
    if (action === "add") {
      update({ media_items: [...(localProfile.media_items || []), payload] });
    } else if (action === "delete") {
      update({ media_items: (localProfile.media_items || []).filter((m) => m.id !== payload) });
    } else if (action === "update") {
      update({ media_items: (localProfile.media_items || []).map((m) => m.id === payload.id ? payload : m) });
    } else if (action === "reorder") {
      const others = (localProfile.media_items || []).filter((m) => m.media_type !== payload.mediaType);
      update({ media_items: [...others, ...payload.items] });
    }
  };

  const handleSaveCharacter = (action, payload) => {
    if (action === "add") update({ characters: [...(localProfile.characters || []), { ...payload, id: crypto.randomUUID() }] });
    else if (action === "delete") update({ characters: (localProfile.characters || []).filter((c) => c.id !== payload) });
  };

  const handleSaveShip = (action, payload) => {
    if (action === "add") update({ ships: [...(localProfile.ships || []), { ...payload, id: crypto.randomUUID() }] });
    else if (action === "delete") update({ ships: (localProfile.ships || []).filter((s) => s.id !== payload) });
  };

  const handleSaveTag = (action, payload) => {
    if (action === "add") update({ tags: [...(localProfile.tags || []), { ...payload, id: crypto.randomUUID() }] });
    else if (action === "delete") update({ tags: (localProfile.tags || []).filter((t) => t.id !== payload) });
  };

  const handleSaveSocialLink = (action, payload) => {
    if (action === "add") update({ social_links: [...(localProfile.social_links || []), { ...payload, id: crypto.randomUUID() }] });
    else if (action === "delete") update({ social_links: (localProfile.social_links || []).filter((l) => l.id !== payload) });
  };

  const handleSaveFandom = (action, payload) => {
    if (action === "addFandom") update({ fandoms: [...(localProfile.fandoms || []), payload] });
    else if (action === "deleteFandom") update({ fandoms: (localProfile.fandoms || []).filter((f) => f.id !== payload) });
    else if (action === "addSpace") update({ fandom_spaces: [...(localProfile.fandom_spaces || []), payload] });
    else if (action === "deleteSpace") update({ fandom_spaces: (localProfile.fandom_spaces || []).filter((s) => s !== payload) });
  };

  const handleReorderSections = (newOrder) => {
    update({ enabled_sections: newOrder });
  };

  const handlePublish = () => {
    onPublish(
      {
        username: localProfile.username,
        bio: localProfile.bio,
        tagline: localProfile.tagline,
        avatar_url: localProfile.avatar_url,
        media_items: localProfile.media_items || [],
        characters: localProfile.characters || [],
        ships: localProfile.ships || [],
        tags: localProfile.tags || [],
        social_links: localProfile.social_links || [],
        fandoms: localProfile.fandoms || [],
        fandom_spaces: localProfile.fandom_spaces || [],
      },
      localProfile.enabled_sections || []
    );
  };

  return (
    <div className="relative">
      {/* Sticky top bar - single line with sections inline */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3 h-3" /> {backLabel || "back"}
          </button>
          <span className="text-border flex-shrink-0">|</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-primary flex-shrink-0">editing</span>
          <span className="text-border flex-shrink-0">|</span>
          {extraActions && <><span className="text-border flex-shrink-0">|</span>{extraActions}</>}
          {/* Sections inline */}
          <SectionManagerBar
            enabledSections={localProfile.enabled_sections || []}
            onToggle={handleToggleSection}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DarkModeToggle />
          {/* User/profile icon - opens profile info modal */}
          <button
            onClick={onProfileClick || (() => setShowProfileSettings(true))}
            title="edit profile info"
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <User className="w-3.5 h-3.5" />
          </button>
          {/* Settings icon - opens url/backup or custom handler */}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              title="settings"
              className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Save / Publish */}
          <button
            onClick={handlePublish}
            disabled={publishing || !localProfile.username?.trim()}
            className="px-5 py-2 bg-foreground text-background rounded-sm font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {publishLabel || (publishing ? "publishing..." : "publish →")}
          </button>
        </div>
      </div>

      <ProfileDisplayView
        profile={localProfile}
        isOwner={true}
        editKey={editKey}
        onSaveMedia={handleSaveMedia}
        onSaveCharacter={handleSaveCharacter}
        onSaveShip={handleSaveShip}
        onSaveTag={handleSaveTag}
        onSaveSocialLink={handleSaveSocialLink}
        onSaveFandom={handleSaveFandom}
        onReorderSections={handleReorderSections}
      />

      {showProfileSettings && (
        <ProfileSettingsModal
          localProfile={localProfile}
          onSave={handleProfileSettingsSave}
          onClose={() => setShowProfileSettings(false)}
        />
      )}
    </div>
  );
}