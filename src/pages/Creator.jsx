const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";

import SectionSelector from "../components/fanfolio/SectionSelector";
import ProfileFormBuilder from "../components/fanfolio/ProfileFormBuilder";
import SuccessScreen from "../components/fanfolio/SuccessScreen";
import CreatorVisualEditor from "../components/fanfolio/CreatorVisualEditor";

function generateId(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

function generateEditKey() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Creator() {
  // steps: 1=section selector, 2=profile form, 3=visual editor, 4=success
  const [step, setStep] = useState(1);
  const [selectedSections, setSelectedSections] = useState([]);
  const [profileData, setProfileData] = useState({
    username: "", bio: "", tagline: "", avatar_url: "",
    media_items: [], characters: [], ships: [], tags: [], social_links: [], fandoms: [], fandom_spaces: [],
  });
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);

  const handlePublish = async (finalProfileData, finalSections) => {
    setPublishing(true);
    const profileId = generateId(6);
    const editKey = generateEditKey();

    await db.entities.FanfolioProfile.create({
      profile_id: profileId,
      edit_key: editKey,
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

    setResult({ profileId, editKey, profile: { ...finalProfileData, enabled_sections: finalSections } });
    setPublishing(false);
    setStep(4);
  };

  if (step === 4 && result) {
    return <SuccessScreen profileId={result.profileId} editKey={result.editKey} profile={result.profile} />;
  }

  if (step === 3) {
    return (
      <CreatorVisualEditor
        profileData={profileData}
        onProfileDataChange={setProfileData}
        selectedSections={selectedSections}
        onSectionsChange={setSelectedSections}
        onBack={() => setStep(2)}
        onPublish={handlePublish}
        publishing={publishing}
      />
    );
  }

  if (step === 2) {
    return (
      <ProfileFormBuilder
        enabledSections={selectedSections}
        profileData={profileData}
        onChange={setProfileData}
        onContinue={() => setStep(3)}
        isCreationMode={true}
      />
    );
  }

  return (
    <SectionSelector
      selected={selectedSections}
      onChange={setSelectedSections}
      onContinue={() => setStep(2)}
    />
  );
}