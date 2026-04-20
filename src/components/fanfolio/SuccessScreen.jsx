const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Check, Copy, ExternalLink, Download, Mail, FolderDown } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";
import { exportProfileAsZip } from "@/utils/exportProfileHtml";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SuccessScreen({ profileId, editKey, profile }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const baseUrl = getSiteUrl();
  const publicUrl = `${baseUrl}/s/${profileId}`;
  const editUrl = `${baseUrl}/s/${profileId}/edit`;

  const copyToClipboard = async (text, which) => {
    await navigator.clipboard.writeText(text);
    if (which === "link") { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    else { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }
  };

  const [emailError, setEmailError] = useState("");

  const handleSendEmail = async () => {
    if (!emailInput.trim()) return;
    setEmailSending(true);
    setEmailError("");
    try {
      await db.integrations.Core.SendEmail({
        to: emailInput.trim(),
        subject: "your fanfolio edit key",
        body: `here's your fanfolio backup.\n\nprofile: ${publicUrl}\nedit url: ${editUrl}\nedit key: ${editKey}\n\nkeep this safe, it cannot be recovered.`,
      });
      setEmailSent(true);
    } catch (err) {
      setEmailError("email sending is unavailable — copy your key manually or download the .txt file.");
    } finally {
      setEmailSending(false);
    }
  };

  const downloadCredentials = () => {
    const content = `FANFOLIO PROFILE CREDENTIALS\n\nProfile URL: ${publicUrl}\nEdit URL: ${editUrl}\nEdit Key: ${editKey}\n\nKeep your edit key safe — it cannot be recovered.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fanfolio-${profileId}-key.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-8">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-3">published</p>
          <h1 className="font-heading text-4xl font-light tracking-tight mb-2">your archive is live.</h1>
          <p className="font-body text-muted-foreground text-sm mb-10 leading-relaxed">
            save your edit key — it cannot be recovered. without it, you won't be able to update your profile.
          </p>

          {/* Profile URL */}
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">profile url</p>
            <div className="flex items-center gap-2 p-3 border border-border rounded-sm bg-muted">
              <span className="font-mono text-sm flex-1 truncate text-foreground">{publicUrl}</span>
              <button
                onClick={() => copyToClipboard(publicUrl, "link")}
                className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "copied" : "copy"}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Edit key */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              edit key <span className="text-primary">save this now</span>
            </p>
            <div className="flex items-center gap-2 p-3 border border-primary/30 rounded-sm bg-primary/5">
              <span className="font-mono text-sm flex-1 truncate text-foreground break-all">{editKey}</span>
              <button
                onClick={() => copyToClipboard(editKey, "key")}
                className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "copied" : "copy"}
              </button>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              to edit later: <span className="text-foreground">{editUrl}</span>
            </p>
          </div>

          {/* Email backup */}
          <div className="mb-6 p-4 border border-border rounded-sm">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">backup key to email</p>
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="flex-1 h-8 text-sm"
              />
              <Button
                onClick={handleSendEmail}
                disabled={emailSending || emailSent || !emailInput.trim()}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {emailSent ? <><Check className="w-3 h-3" /> sent</> : emailSending ? "sending..." : <><Mail className="w-3 h-3" /> send</>}
              </Button>
            </div>
            {emailError && <p className="font-mono text-[10px] text-destructive mt-2">{emailError}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <button
              onClick={downloadCredentials}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-sm font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> download .txt
            </button>
            {profile && (
              <button
                onClick={() => exportProfileAsZip(profile)}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-sm font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <FolderDown className="w-3.5 h-3.5" /> export zip
              </button>
            )}
            <a
              href={publicUrl}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-foreground text-background rounded-sm font-mono text-xs tracking-wider uppercase hover:bg-primary transition-colors"
            >
              view profile <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}