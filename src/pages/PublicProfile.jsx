const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ProfileDisplayView from "../components/fanfolio/ProfileDisplayView";
import { Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import DarkModeToggle from "../components/fanfolio/DarkModeToggle";

function setPageMeta(name, avatarUrl) {
  document.title = name ? `${name}'s fanfolio` : "fanfolio";
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (avatarUrl) {
    link.href = avatarUrl;
    link.type = "image/png";
  } else {
    link.href = "https://db.com/logo_v2.svg";
    link.type = "image/svg+xml";
  }
}

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
    return () => {
      document.title = "fanfolio";
    };
  }, [id]);

  const loadProfile = async () => {
    // try profile_id first, then slug
    let results = await db.entities.FanfolioProfile.filter({ profile_id: id });
    if (results.length === 0) {
      results = await db.entities.FanfolioProfile.filter({ slug: id });
    }
    if (results.length === 0) {
      setNotFound(true);
    } else {
      setProfile(results[0]);
      setPageMeta(results[0].username, results[0].avatar_url);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">404</p>
          <h1 className="font-heading text-4xl font-light">Profile not found.</h1>
          <p className="font-body text-muted-foreground mt-4 text-sm">
            This archive doesn't exist or may have been removed.
          </p>
          <Link to="/" className="inline-block mt-8 font-mono text-xs tracking-widest uppercase text-primary hover:underline">
            Create your own →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ProfileDisplayView profile={profile} isOwner={false} />
      {/* Bottom-right controls */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <DarkModeToggle className="bg-background border border-border shadow-sm" />
        <Link
          to={`/s/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-sm font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors shadow-sm"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </Link>
      </div>
    </div>
  );
}