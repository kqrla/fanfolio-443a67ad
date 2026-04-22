const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { getSiteUrl } from "@/lib/site-url";
import CreatorVisualEditor from "../components/fanfolio/CreatorVisualEditor";
import { ArrowLeft, Mail, Check, X, Download, FolderDown } from "lucide-react";
import { exportProfileAsZip } from "@/utils/exportProfileHtml";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function slugValid(s) {
  return /^[a-z0-9-]{1,}$/.test(s);
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ profile, profileData, onClose }) {
  const baseUrl = getSiteUrl();
  const publicUrl = `${baseUrl}/s/${profile.profile_id}`;

  const [slugInput, setSlugInput] = useState(profile.slug || "");
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugSaved, setSlugSaved] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateSlug = async (value) => {
    setSlugInput(value);
    setSlugError("");
    setSlugSaved(false);
    if (!value) return;
    if (!slugValid(value)) { setSlugError("lowercase letters, numbers, and hyphens only"); return; }
    if (value === profile.slug) return;
    setSlugChecking(true);
    const existing = await db.entities.FanfolioProfile.filter({ slug: value });
    setSlugChecking(false);
    if (existing.length > 0) setSlugError("this slug is already taken");
  };

  const saveSlug = async () => {
    if (slugError || slugChecking) return;
    await db.entities.FanfolioProfile.update(profile.id, { slug: slugInput.trim() || null });
    setSlugSaved(true);
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) return;
    setEmailSending(true); setEmailError("");
    try {
      const editUrl = `${baseUrl}/s/${profile.profile_id}/edit`;
      await db.integrations.Core.SendEmail({
        to: emailInput.trim(),
        subject: "your fanfolio edit key",
        body: `here's your fanfolio backup.\n\nprofile: ${publicUrl}\nedit url: ${editUrl}\nedit key: ${profile.edit_key}\n\nkeep this safe — it cannot be recovered.`,
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch {
      setEmailError("email sending failed — copy your key manually.");
    } finally {
      setEmailSending(false);
    }
  };

  const slugPreview = slugInput && !slugError ? `${baseUrl}/s/${slugInput}` : null;
  const editUrl = `${baseUrl}/s/${profile.profile_id}/edit`;

  const downloadCredentials = () => {
    const content = `FANFOLIO PROFILE CREDENTIALS\n\nProfile URL: ${publicUrl}\nEdit URL: ${editUrl}\nEdit Key: ${profile.edit_key}\n\nKeep your edit key safe — it cannot be recovered.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fanfolio-${profile.profile_id}-key.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-background border border-border rounded-sm p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-light">profile settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Custom URL */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">custom url slug</p>
          <div className="flex gap-2">
            <Input
              value={slugInput}
              onChange={(e) => validateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="e.g. your-name"
              className="flex-1"
            />
            <Button onClick={saveSlug} disabled={!!slugError || slugChecking} size="sm" variant="outline">
              {slugSaved ? "saved ✓" : "save"}
            </Button>
          </div>
          {slugChecking && <p className="font-mono text-[10px] text-muted-foreground mt-1">checking...</p>}
          {slugError && <p className="font-mono text-[10px] text-destructive mt-1">{slugError}</p>}
          {slugPreview && !slugError && <p className="font-mono text-[10px] text-primary mt-1">{slugPreview}</p>}
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            original url: <span className="text-foreground">{publicUrl}</span>
          </p>
        </div>

        {/* Email backup */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">backup edit key to email</p>
          <div className="flex gap-2">
            <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@example.com" type="email" className="flex-1" />
            <Button onClick={handleSendEmail} disabled={emailSending || emailSent || !emailInput.trim()} variant="outline" size="sm">
              {emailSent ? <><Check className="w-3 h-3" /> sent</> : emailSending ? "..." : <><Mail className="w-3 h-3" /> send</>}
            </Button>
          </div>
          {emailError && <p className="font-mono text-[10px] text-destructive mt-1">{emailError}</p>}
        </div>

        {/* Downloads */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">downloads</p>
          <div className="flex gap-2">
            <button
              onClick={downloadCredentials}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm font-mono text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Download className="w-3 h-3" /> key .txt
            </button>
            {profileData && (
              <button
                onClick={() => exportProfileAsZip({ ...profileData, enabled_sections: profile.enabled_sections, edit_key: profile.edit_key, profile_id: profile.profile_id })}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm font-mono text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <FolderDown className="w-3 h-3" /> export zip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function EditProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [keyInput, setKeyInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [keyError, setKeyError] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [enabledSections, setEnabledSections] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { loadProfile(); }, [id]);

  const sessionKeyName = `fanfolio:editkey:${id}`;

  const hydrateProfileData = (p) => {
    setProfileData({
      username: p.username || "",
      bio: p.bio || "",
      tagline: p.tagline || "",
      avatar_url: p.avatar_url || "",
      media_items: p.media_items || [],
      characters: p.characters || [],
      ships: p.ships || [],
      tags: p.tags || [],
      social_links: p.social_links || [],
      fandoms: p.fandoms || [],
      fandom_spaces: p.fandom_spaces || [],
    });
    setEnabledSections(p.enabled_sections || []);
    setUnlocked(true);
    setKeyError(false);
  };

  const loadProfile = async () => {
    let results = await db.entities.FanfolioProfile.filter({ profile_id: id });
    if (results.length === 0) results = await db.entities.FanfolioProfile.filter({ slug: id });
    if (results.length === 0) { setNotFound(true); setLoading(false); return; }
    const p = results[0];
    setProfile(p);
    // Auto-unlock if a matching key was saved this session
    try {
      const saved = sessionStorage.getItem(sessionKeyName);
      if (saved && saved === p.edit_key) hydrateProfileData(p);
    } catch { /* sessionStorage unavailable */ }
    setLoading(false);
  };

  const handleUnlock = () => {
    if (keyInput.trim() === profile.edit_key) {
      try { sessionStorage.setItem(sessionKeyName, profile.edit_key); } catch { /* ignore */ }
      hydrateProfileData(profile);
    } else {
      setKeyError(true);
    }
  };

  // Called by CreatorVisualEditor's publish/save button
  const handleSave = async (finalProfileData, finalSections) => {
    setSaving(true);
    await db.entities.FanfolioProfile.update(profile.id, {
      username: finalProfileData.username,
      bio: finalProfileData.bio,
      tagline: finalProfileData.tagline,
      avatar_url: finalProfileData.avatar_url,
      enabled_sections: finalSections,
      media_items: finalProfileData.media_items || [],
      characters: finalProfileData.characters || [],
      ships: finalProfileData.ships || [],
      tags: finalProfileData.tags || [],
      social_links: finalProfileData.social_links || [],
      fandoms: finalProfileData.fandoms || [],
      fandom_spaces: finalProfileData.fandom_spaces || [],
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">404</p>
        <h1 className="font-heading text-4xl font-light">Profile not found.</h1>
        <Link to="/" className="inline-block mt-8 font-mono text-xs tracking-widest uppercase text-primary hover:underline">Create your own →</Link>
      </div>
    </div>
  );

  if (!unlocked) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to={`/s/${id}`} className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> back to profile
        </Link>
        <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-4">edit archive</p>
        <h1 className="font-heading text-4xl font-light tracking-tight mb-2">enter your edit key.</h1>
        <p className="font-body text-muted-foreground text-sm mb-8 leading-relaxed">
          this is the key you received when you first published your profile.
        </p>
        <div className="space-y-3">
          <Input
            type="password"
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); setKeyError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="paste your edit key"
            className={keyError ? "border-destructive" : ""}
          />
          {keyError && <p className="font-mono text-[10px] text-destructive">incorrect key. please try again.</p>}
          <Button onClick={handleUnlock} className="w-full">unlock profile</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CreatorVisualEditor
        profileData={profileData}
        onProfileDataChange={setProfileData}
        selectedSections={enabledSections}
        onSectionsChange={setEnabledSections}
        onBack={() => window.location.href = `/s/${id}`}
        onPublish={handleSave}
        publishing={saving}
        publishLabel={saved ? "saved ✓" : saving ? "saving..." : "save changes"}
        backLabel="view public"
        onSettingsClick={() => setShowSettings(true)}
        editKey={profile.edit_key}
      />
      {showSettings && <SettingsPanel profile={profile} profileData={profileData} onClose={() => setShowSettings(false)} />}
    </>
  );
}