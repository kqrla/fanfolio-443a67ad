const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import TmdbSearchInput from "./TmdbSearchInput";
import FandomsSection from "./FandomsSection";

const MEDIA_LABELS = {
  tv_show:     "tv shows",
  movie:       "movies",
  documentary: "documentaries",
  book:        "books",
  artist:      "artists",
  podcast:     "podcasts",
  video_game:  "video games",
  anime:       "anime",
  fanfiction:  "fanfiction",
  creator:     "creators",
};

const MEDIA_SECTION_TYPES = ["tv_show", "movie", "documentary", "book", "artist", "podcast", "video_game", "anime", "fanfiction", "creator"];

const SOCIAL_PLATFORM_OPTIONS = [
  "letterboxd", "serializd", "musicboard", "twitter", "bluesky",
  "mastodon", "reddit", "ao3", "kofi", "spotify", "gumroad", "vgen", "website", "store", "email",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionBlock({ title, children }) {
  return (
    <div className="border border-border rounded-sm p-6">
      <h3 className="font-heading text-2xl font-light mb-1">{title}</h3>
      <div className="h-px w-10 bg-primary mb-4" />
      {children}
    </div>
  );
}

function AvatarUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };
  return (
    <div className="mt-1 flex items-center gap-3">
      {value && <img src={value} alt="avatar" className="w-12 h-16 object-cover rounded-sm" />}
      <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border border-border rounded-sm px-3 py-2">
        <Upload className="w-3 h-3" />
        {uploading ? "uploading..." : value ? "change" : "upload"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}

const CREATOR_TYPES = ["streamer", "influencer", "comedian", "educator", "musician", "podcaster", "artist", "writer", "filmmaker", "other"];

function MediaItemMiniForm({ mediaType, onAdd }) {
  const [form, setForm] = useState({ title: "", subtitle: "", link: "", image_url: "", creator_type: "" });
  const [uploading, setUploading] = useState(false);

  const isCreator = mediaType === "creator";
  const showLink = mediaType === "fanfiction" || isCreator;
  const subtitleLabel = isCreator ? "platform" : "subtitle";
  const subtitlePlaceholder = isCreator ? "youtube, twitch, etc." : "author / creator";
  const linkLabel = isCreator ? "profile url" : "ao3 link";
  const linkPlaceholder = isCreator ? "https://youtube.com/@..." : "https://archiveofourown.org/...";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({ ...form, media_type: mediaType, id: crypto.randomUUID() });
    setForm({ title: "", subtitle: "", link: "", image_url: "", creator_type: "" });
  };

  const handleTmdbSelect = (item) => {
    setForm((f) => ({
      ...f,
      title: item.title,
      subtitle: item.subtitle || f.subtitle,
      image_url: item.image_url || f.image_url,
    }));
  };

  return (
    <div className="p-4 bg-muted rounded-sm space-y-3 mt-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">title *</label>
          <div className="mt-1">
            <TmdbSearchInput
              mediaType={mediaType}
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              onSelect={handleTmdbSelect}
              placeholder={isCreator ? "creator name" : "title"}
            />
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{subtitleLabel}</label>
          <Input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            placeholder={subtitlePlaceholder}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>
      {isCreator && (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">creator type</label>
          <Select value={form.creator_type} onValueChange={(v) => setForm((f) => ({ ...f, creator_type: v }))}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="select type..." /></SelectTrigger>
            <SelectContent>
              {CREATOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {showLink && (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{linkLabel}</label>
          <Input
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder={linkPlaceholder}
            className="mt-1 h-8 text-sm"
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
          <Upload className="w-3 h-3" />
          {uploading ? "uploading..." : form.image_url ? "cover ✓" : "upload cover"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        <Button onClick={handleAdd} size="sm" disabled={!form.title.trim()} className="ml-auto h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" /> add
        </Button>
      </div>
    </div>
  );
}

function InlineListBuilder({ items, fields, onAdd, onRemove, renderItem }) {
  const [form, setForm] = useState({});
  const [showing, setShowing] = useState(false);

  const handleAdd = () => {
    if (!form[fields[0].key]?.trim()) return;
    onAdd(form);
    setForm({});
    setShowing(false);
  };

  return (
    <div>
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2 border border-border rounded-sm">
              <span className="font-body text-sm">{renderItem(item)}</span>
              <button onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {showing ? (
        <div className="p-3 bg-muted rounded-sm space-y-2">
          {fields.map((f) => (
            <Input
              key={f.key}
              value={form[f.key] || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="h-8 text-sm"
            />
          ))}
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="h-7 text-xs">add</Button>
            <button onClick={() => setShowing(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowing(true)} className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> add
        </button>
      )}
    </div>
  );
}

function TagBuilder({ items, onAdd, onRemove }) {
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState({ name: "", tag_type: "trope" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm({ name: "", tag_type: "trope" });
    setShowing(false);
  };

  return (
    <div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1.5 px-3 py-1 border border-border rounded-full text-sm">
              {tag.name}
              <span className="font-mono text-[9px] text-muted-foreground">{tag.tag_type}</span>
              <button onClick={() => onRemove(tag.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {showing ? (
        <div className="p-3 bg-muted rounded-sm space-y-2">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. enemies to lovers"
            className="h-8 text-sm"
          />
          <Select value={form.tag_type} onValueChange={(v) => setForm((f) => ({ ...f, tag_type: v }))}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="trope">trope</SelectItem>
              <SelectItem value="genre">genre</SelectItem>
              <SelectItem value="ao3">ao3 tag</SelectItem>
              <SelectItem value="arc">arc</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="h-7 text-xs">add</Button>
            <button onClick={() => setShowing(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowing(true)} className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> add tag
        </button>
      )}
    </div>
  );
}

function SocialLinksBuilder({ items, onAdd, onRemove }) {
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState({ platform: "website", url: "" });

  const isEmail = form.platform === "email";

  const handleAdd = () => {
    if (!form.url.trim()) return;
    const url = isEmail && !form.url.startsWith("mailto:") ? `mailto:${form.url}` : form.url;
    onAdd({ ...form, url });
    setForm({ platform: "website", url: "" });
    setShowing(false);
  };

  return (
    <div>
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((link) => (
            <div key={link.id} className="flex items-center justify-between px-3 py-2 border border-border rounded-sm">
              <div>
                <span className="font-mono text-xs text-muted-foreground mr-2">{link.platform}</span>
                <span className="font-body text-sm truncate">{link.url}</span>
              </div>
              <button onClick={() => onRemove(link.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {showing ? (
        <div className="p-3 bg-muted rounded-sm space-y-2">
          <Select value={form.platform} onValueChange={(v) => setForm({ platform: v, url: "" })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder={isEmail ? "you@example.com" : "https://..."}
            type={isEmail ? "email" : "url"}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="h-7 text-xs" disabled={!form.url.trim()}>add</Button>
            <button onClick={() => setShowing(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowing(true)} className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> add link
        </button>
      )}
    </div>
  );
}

const ALL_SECTIONS = [
  { key: "tv_show", label: "tv shows" },
  { key: "movie", label: "movies" },
  { key: "documentary", label: "documentaries" },
  { key: "book", label: "books" },
  { key: "artist", label: "artists" },
  { key: "podcast", label: "podcasts" },
  { key: "video_game", label: "video games" },
  { key: "anime", label: "anime" },
  { key: "fanfiction", label: "fanfiction" },
  { key: "creator", label: "creators" },
  { key: "characters", label: "characters" },
  { key: "ships", label: "ships" },
  { key: "fandoms", label: "fandoms" },
  { key: "tags", label: "tropes & tags" },
  { key: "social_links", label: "social links" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileFormBuilder({ enabledSections, onSectionsChange, profileData, onChange, onPublish, onContinue, publishing, isEditMode = false, isCreationMode = false, editExtras = null }) {
  const [activeAddSection, setActiveAddSection] = useState(null);

  const toggleSection = (key) => {
    if (!onSectionsChange) return;
    const next = enabledSections.includes(key)
      ? enabledSections.filter((s) => s !== key)
      : [...enabledSections, key];
    onSectionsChange(next);
  };

  const activeMediaTypes = MEDIA_SECTION_TYPES.filter((t) => enabledSections.includes(t));
  const showCharacters = enabledSections.includes("characters");
  const showShips = enabledSections.includes("ships");
  const showFandoms = enabledSections.includes("fandoms");
  const showTags = enabledSections.includes("tags");
  const showSocialLinks = enabledSections.includes("social_links");

  const addMediaItem = (item) => {
    onChange({ ...profileData, media_items: [...(profileData.media_items || []), item] });
    setActiveAddSection(null);
  };
  const removeMediaItem = (id) => onChange({ ...profileData, media_items: (profileData.media_items || []).filter((i) => i.id !== id) });

  const addCharacter = (char) => onChange({ ...profileData, characters: [...(profileData.characters || []), { ...char, id: crypto.randomUUID() }] });
  const removeCharacter = (id) => onChange({ ...profileData, characters: (profileData.characters || []).filter((c) => c.id !== id) });

  const addShip = (ship) => onChange({ ...profileData, ships: [...(profileData.ships || []), { ...ship, id: crypto.randomUUID() }] });
  const removeShip = (id) => onChange({ ...profileData, ships: (profileData.ships || []).filter((s) => s.id !== id) });

  const addTag = (tag) => onChange({ ...profileData, tags: [...(profileData.tags || []), { ...tag, id: crypto.randomUUID() }] });
  const removeTag = (id) => onChange({ ...profileData, tags: (profileData.tags || []).filter((t) => t.id !== id) });

  const addSocialLink = (link) => onChange({ ...profileData, social_links: [...(profileData.social_links || []), { ...link, id: crypto.randomUUID() }] });
  const removeSocialLink = (id) => onChange({ ...profileData, social_links: (profileData.social_links || []).filter((l) => l.id !== id) });

  const addFandom = (fandom) => onChange({ ...profileData, fandoms: [...(profileData.fandoms || []), fandom] });
  const removeFandom = (id) => onChange({ ...profileData, fandoms: (profileData.fandoms || []).filter((f) => f.id !== id) });
  const addFandomSpace = (space) => onChange({ ...profileData, fandom_spaces: [...(profileData.fandom_spaces || []), space] });
  const removeFandomSpace = (space) => onChange({ ...profileData, fandom_spaces: (profileData.fandom_spaces || []).filter((s) => s !== space) });

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-4">{isEditMode ? "fanfolio - edit" : isCreationMode ? "fanfolio - step 4 of 5" : "fanfolio"}</p>
          <h1 className="font-heading text-4xl font-light tracking-tight">{isEditMode ? "edit your archive." : "set up your profile."}</h1>
          <p className="font-body text-muted-foreground mt-3 text-sm">{isCreationMode ? "fill in your profile details. you'll populate your media on the next screen." : "add your profile info and populate each section."}</p>
        </div>

        {/* Profile info */}
        <SectionBlock title="profile">
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">display name</label>
              <Input
                value={profileData.username || ""}
                onChange={(e) => onChange({ ...profileData, username: e.target.value })}
                placeholder="your name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">tagline</label>
              <Input
                value={profileData.tagline || ""}
                onChange={(e) => onChange({ ...profileData, tagline: e.target.value })}
                placeholder="e.g. professional overthinker"
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">bio</label>
              <Textarea
                value={profileData.bio || ""}
                onChange={(e) => onChange({ ...profileData, bio: e.target.value })}
                placeholder="a few words about your taste"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">avatar</label>
              <AvatarUpload
                value={profileData.avatar_url}
                onChange={(url) => onChange({ ...profileData, avatar_url: url })}
              />
            </div>
          </div>
        </SectionBlock>

        {/* Media sections - hidden in creation mode (user fills them on the visual editor step) */}
        {!isCreationMode && activeMediaTypes.map((mediaType) => {
          const sectionItems = (profileData.media_items || []).filter((i) => i.media_type === mediaType);
          return (
            <SectionBlock key={mediaType} title={MEDIA_LABELS[mediaType]}>
              {sectionItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm">
                      {item.image_url && <img src={item.image_url} alt="" className="w-5 h-7 object-cover rounded-[2px]" />}
                      <span className="font-body text-sm">{item.title}</span>
                      <button onClick={() => removeMediaItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeAddSection === mediaType ? (
                <div>
                  <MediaItemMiniForm mediaType={mediaType} onAdd={addMediaItem} />
                  <button onClick={() => setActiveAddSection(null)} className="font-mono text-[10px] text-muted-foreground mt-2 hover:text-primary transition-colors">
                    cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveAddSection(mediaType)}
                  className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> add item
                </button>
              )}
            </SectionBlock>
          );
        })}

        {/* Characters - hidden in creation mode */}
        {!isCreationMode && showCharacters && (
          <SectionBlock title="characters">
            <InlineListBuilder
              items={profileData.characters || []}
              fields={[
                { key: "name", placeholder: "character name" },
                { key: "source", placeholder: "source (e.g. jujutsu kaisen)" },
              ]}
              onAdd={addCharacter}
              onRemove={removeCharacter}
              renderItem={(c) => (
                <span>{c.name} <span className="text-muted-foreground font-mono text-[10px] ml-1">- {c.source}</span></span>
              )}
            />
          </SectionBlock>
        )}

        {/* Ships - hidden in creation mode */}
        {!isCreationMode && showShips && (
          <SectionBlock title="ships">
            <InlineListBuilder
              items={profileData.ships || []}
              fields={[
                { key: "name", placeholder: "ship name (e.g. steve × bucky)" },
                { key: "show", placeholder: "source / show" },
                { key: "ship_characters", placeholder: "characters (comma-separated)" },
                { key: "tropes", placeholder: "tropes (comma-separated)" },
                { key: "note", placeholder: "optional note" },
              ]}
              onAdd={addShip}
              onRemove={removeShip}
              renderItem={(s) => (
                <span>{s.name} {s.show && <span className="text-muted-foreground font-mono text-[10px] ml-1">- {s.show}</span>}</span>
              )}
            />
          </SectionBlock>
        )}

        {/* Fandoms - hidden in creation mode */}
        {!isCreationMode && showFandoms && (
          <SectionBlock title="fandoms">
            <FandomsSection
              fandoms={profileData.fandoms || []}
              fandomSpaces={profileData.fandom_spaces || []}
              isOwner={true}
              onAddFandom={addFandom}
              onDeleteFandom={removeFandom}
              onAddSpace={addFandomSpace}
              onDeleteSpace={removeFandomSpace}
              inFormBuilder={true}
            />
          </SectionBlock>
        )}

        {/* Tags - hidden in creation mode */}
        {!isCreationMode && showTags && (
          <SectionBlock title="tropes & tags">
            <TagBuilder items={profileData.tags || []} onAdd={addTag} onRemove={removeTag} />
          </SectionBlock>
        )}

        {/* Social links - hidden in creation mode */}
        {!isCreationMode && showSocialLinks && (
          <SectionBlock title="social links">
            <SocialLinksBuilder
              items={profileData.social_links || []}
              onAdd={addSocialLink}
              onRemove={removeSocialLink}
            />
          </SectionBlock>
        )}

        {/* Section toggles - shown in edit mode only, not creation mode (sections chosen earlier) */}
        {onSectionsChange && !isCreationMode && (
          <SectionBlock title="sections">
            <div className="grid grid-cols-2 gap-2">
              {ALL_SECTIONS.map((s) => {
                const active = enabledSections.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleSection(s.key)}
                    className={`flex items-center justify-between px-3 py-2.5 border rounded-sm text-left transition-all text-sm ${active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/30"}`}
                  >
                    <span className="font-body">{s.label}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${active ? "border-primary bg-primary" : "border-border"}`} />
                  </button>
                );
              })}
            </div>
          </SectionBlock>
        )}

        {/* Edit extras (slug, email backup) injected from edit page */}
        {editExtras}

        {/* Creation mode: Continue to visual editor */}
        {isCreationMode && (
          <>
            <button
              onClick={onContinue}
              disabled={!profileData.username?.trim()}
              className="w-full py-4 bg-foreground text-background font-mono text-xs tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary transition-colors rounded-sm"
            >
              continue → build your archive
            </button>
            {!profileData.username?.trim() && (
              <p className="text-center font-mono text-[10px] text-muted-foreground">add a display name to continue</p>
            )}
          </>
        )}
        {/* Legacy publish button (non-creation, non-edit mode) */}
        {!isEditMode && !isCreationMode && (
          <>
            <button
              onClick={onPublish}
              disabled={publishing || !profileData.username?.trim()}
              className="w-full py-4 bg-foreground text-background font-mono text-xs tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary transition-colors rounded-sm"
            >
              {publishing ? "publishing..." : "publish profile →"}
            </button>
            {!profileData.username?.trim() && (
              <p className="text-center font-mono text-[10px] text-muted-foreground">add a display name to publish</p>
            )}
          </>
        )}
        {isEditMode && (
          <p className="text-center font-mono text-[10px] text-muted-foreground pb-8">use the "save changes" button at the top to persist all edits.</p>
        )}
      </div>
    </div>
  );
}