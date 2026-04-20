const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link } from "react-router-dom";

import { getSiteUrl } from "@/lib/site-url";
import { Plus, X, ExternalLink, LogOut, Eye, EyeOff, Edit2, Archive, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "fanfolio_account";
const CLAIMED_KEY = "fanfolio_claimed_archives";

function loadAccount() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}
function saveAccount(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadClaimed() {
  try { return JSON.parse(localStorage.getItem(CLAIMED_KEY) || "[]"); } catch { return []; }
}
function saveClaimed(list) {
  localStorage.setItem(CLAIMED_KEY, JSON.stringify(list));
}

// ─── Auth panel ───────────────────────────────────────────────────────────────
function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email.trim() || !password.trim()) { setError("please fill in both fields."); return; }
    if (password.length < 6) { setError("password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const existing = loadAccount();
    if (mode === "signup") {
      if (existing && existing.email === email.trim()) {
        setError("an account with this email already exists. sign in instead.");
        setLoading(false);
        return;
      }
      const account = { email: email.trim(), password, createdAt: new Date().toISOString() };
      saveAccount(account);
      onAuth(account);
    } else {
      if (!existing || existing.email !== email.trim() || existing.password !== password) {
        setError("incorrect email or password.");
        setLoading(false);
        return;
      }
      onAuth(existing);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
      <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-8 flex items-center gap-3">
        <span className="h-px w-8 bg-primary inline-block" />
        {mode === "signup" ? "create account" : "sign in"}
      </p>
      <h1 className="font-heading text-4xl md:text-5xl font-light tracking-tight mb-3">
        {mode === "signup" ? "your archive hub." : "welcome back."}
      </h1>
      <p className="font-body text-muted-foreground text-sm mb-10 leading-relaxed">
        {mode === "signup"
          ? "collect all your fanfolio archives in one place. no account ever required to publish — this is just for convenience."
          : "sign in to access all your claimed archives."}
      </p>

      <div className="space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            placeholder="you@example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">password</label>
          <div className="relative mt-1.5">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handle()}
              placeholder="at least 6 characters"
              className="pr-10"
            />
            <button
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        {error && <p className="font-mono text-[10px] text-destructive">{error}</p>}
        <button
          onClick={handle}
          disabled={loading}
          className="w-full py-3 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? "..." : <>{mode === "signup" ? "create account" : "sign in"} <ArrowRight className="w-3 h-3" /></>}
        </button>
      </div>

      <button
        onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
        className="mt-5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
      >
        {mode === "signup" ? "already have an account? sign in →" : "no account? create one →"}
      </button>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">just want to edit?</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          go to <span className="font-mono text-xs text-foreground">/s/[your-id]/edit</span> and enter your edit key. no account needed.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Claim form ───────────────────────────────────────────────────────────────
function ClaimForm({ onClaim }) {
  const [open, setOpen] = useState(false);
  const [profileInput, setProfileInput] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    const id = profileInput.trim();
    const key = keyInput.trim();
    if (!id || !key) { setError("enter both a profile id (or slug) and your edit key."); return; }
    setLoading(true);
    setError("");
    let results = await db.entities.FanfolioProfile.filter({ profile_id: id });
    if (results.length === 0) results = await db.entities.FanfolioProfile.filter({ slug: id });
    if (results.length === 0) { setError("profile not found."); setLoading(false); return; }
    const profile = results[0];
    if (profile.edit_key !== key) { setError("incorrect edit key."); setLoading(false); return; }
    onClaim({ id: profile.id, profile_id: profile.profile_id, slug: profile.slug, username: profile.username, avatar_url: profile.avatar_url, edit_key: key });
    setProfileInput(""); setKeyInput(""); setOpen(false);
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors border border-dashed border-border hover:border-primary rounded-sm px-4 py-3 w-full justify-center"
      >
        <Plus className="w-3 h-3" /> claim an existing archive
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-sm p-5 space-y-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">claim archive</p>
      <Input
        value={profileInput}
        onChange={(e) => { setProfileInput(e.target.value); setError(""); }}
        placeholder="profile id or slug"
        className="h-8 text-sm"
      />
      <Input
        value={keyInput}
        onChange={(e) => { setKeyInput(e.target.value); setError(""); }}
        placeholder="edit key"
        className="h-8 text-sm font-mono"
        type="password"
      />
      {error && <p className="font-mono text-[10px] text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={handle}
          disabled={loading}
          className="px-4 py-1.5 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm disabled:opacity-40"
        >
          {loading ? "checking..." : "claim"}
        </button>
        <button onClick={() => setOpen(false)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">
          cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Archive card ─────────────────────────────────────────────────────────────
function ArchiveCard({ archive, onRemove }) {
  const baseUrl = getSiteUrl();
  const publicUrl = `${baseUrl}/s/${archive.profile_id}`;
  const editUrl = `/s/${archive.profile_id}/edit?key=${archive.edit_key}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border border-border rounded-sm p-5 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-4 min-w-0">
        {archive.avatar_url
          ? <img src={archive.avatar_url} alt="" className="w-9 h-12 object-cover rounded-sm flex-shrink-0" />
          : <div className="w-9 h-12 bg-muted rounded-sm flex-shrink-0 flex items-center justify-center"><Archive className="w-3 h-3 text-muted-foreground" /></div>
        }
        <div className="min-w-0">
          <p className="font-heading text-lg font-light truncate">{archive.username || "untitled archive"}</p>
          <p className="font-mono text-[9px] text-muted-foreground truncate">{archive.slug || archive.profile_id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          title="view public"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
        <Link
          to={editUrl}
          className="w-7 h-7 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          title="edit archive"
        >
          <Edit2 className="w-3 h-3" />
        </Link>
        <button
          onClick={() => onRemove(archive.id)}
          className="w-7 h-7 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
          title="remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ account, onLogout }) {
  const [claimed, setClaimed] = useState(loadClaimed);

  const handleClaim = (archive) => {
    if (claimed.some((c) => c.profile_id === archive.profile_id)) return;
    const next = [...claimed, archive];
    saveClaimed(next);
    setClaimed(next);
  };

  const handleRemove = (id) => {
    const next = claimed.filter((c) => c.id !== id);
    saveClaimed(next);
    setClaimed(next);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-primary inline-block" />
            your archive hub
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-light">{account.email}</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mt-1"
        >
          <LogOut className="w-3 h-3" /> sign out
        </button>
      </div>

      {/* Archives */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            archives <span className="text-primary ml-1">{claimed.length > 0 ? `(${claimed.length})` : ""}</span>
          </p>
        </div>

        {claimed.length === 0 ? (
          <div className="mb-4">
            <p className="font-body text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-sm mb-4">
              no archives yet. claim one below or build a new one.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <AnimatePresence>
              {claimed.map((archive) => (
                <ArchiveCard key={archive.id} archive={archive} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <ClaimForm onClaim={handleClaim} />
      </div>

      {/* New archive */}
      <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">start fresh?</p>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
        >
          build a new archive <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Account() {
  const [account, setAccount] = useState(loadAccount);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/landing" className="font-mono text-[11px] tracking-widest uppercase text-primary">fanfolio</Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link to="/features" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">features</Link>
          <Link
            to="/"
            className="px-5 py-2 bg-foreground text-background font-mono text-[10px] tracking-widest uppercase hover:bg-primary transition-colors rounded-sm"
          >
            build yours
          </Link>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-65px)] flex items-start justify-center px-6 py-20 md:py-28">
        <AnimatePresence mode="wait">
          {account
            ? <Dashboard key="dashboard" account={account} onLogout={() => { setAccount(null); saveAccount(null); }} />
            : <AuthPanel key="auth" onAuth={setAccount} />
          }
        </AnimatePresence>
      </div>
    </div>
  );
}