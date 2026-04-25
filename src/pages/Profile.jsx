const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from "react";

import HeroMasthead from "../components/fanfolio/HeroMasthead";
import MediaSection from "../components/fanfolio/MediaSection";
import ArtistDrawer from "../components/fanfolio/ArtistDrawer";
import CharacterList from "../components/fanfolio/CharacterList";
import ShipList from "../components/fanfolio/ShipList";
import TropeStrip from "../components/fanfolio/TropeStrip";

const MEDIA_TYPES = ["tv_show", "movie", "book", "artist", "podcast", "video_game", "anime", "fanfiction"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [ships, setShips] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistDrawerOpen, setArtistDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const me = await db.auth.me();
    setUser(me);
  }, []);

  const loadData = useCallback(async () => {
    const [media, chars, shipData, tagData] = await Promise.all([
      db.entities.MediaItem.list("-created_date", 200),
      db.entities.Character.list("-created_date", 100),
      db.entities.Ship.list("-created_date", 100),
      db.entities.FandomTag.list("-created_date", 100),
    ]);
    setMediaItems(media);
    setCharacters(chars);
    setShips(shipData);
    setTags(tagData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
    loadData();
  }, []);

  const isOwner = !!user;

  const itemsByType = (type) => mediaItems.filter((m) => m.media_type === type);

  const handleAddMedia = async (data) => {
    await db.entities.MediaItem.create(data);
    loadData();
  };

  const handleDeleteMedia = async (id) => {
    await db.entities.MediaItem.delete(id);
    loadData();
  };

  const handleCardClick = (item) => {
    if (item.media_type === "artist") {
      setSelectedArtist(item);
      setArtistDrawerOpen(true);
    }
  };

  const handleAddCharacter = async (data) => {
    await db.entities.Character.create(data);
    loadData();
  };

  const handleDeleteCharacter = async (id) => {
    await db.entities.Character.delete(id);
    loadData();
  };

  const handleAddShip = async (data) => {
    await db.entities.Ship.create(data);
    loadData();
  };

  const handleDeleteShip = async (id) => {
    await db.entities.Ship.delete(id);
    loadData();
  };

  const handleAddTag = async (data) => {
    await db.entities.FandomTag.create(data);
    loadData();
  };

  const handleDeleteTag = async (id) => {
    await db.entities.FandomTag.delete(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroMasthead user={user} onUserUpdate={loadUser} />

      {/* Media Sections */}
      {MEDIA_TYPES.map((type) => (
        <MediaSection
          key={type}
          mediaType={type}
          items={itemsByType(type)}
          onCardClick={handleCardClick}
          onAdd={handleAddMedia}
          onDelete={handleDeleteMedia}
          isOwner={isOwner}
        />
      ))}

      {/* Characters */}
      <CharacterList
        characters={characters}
        isOwner={isOwner}
        onAdd={handleAddCharacter}
        onDelete={handleDeleteCharacter}
      />

      {/* Ships */}
      <ShipList
        ships={ships}
        isOwner={isOwner}
        onAdd={handleAddShip}
        onDelete={handleDeleteShip}
      />

      {/* Tropes & Tags */}
      <TropeStrip
        tags={tags}
        isOwner={isOwner}
        onAdd={handleAddTag}
        onDelete={handleDeleteTag}
      />

      {/* Footer */}
      <footer className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            fanfolio - a curated taste archive
          </p>
        </div>
      </footer>

      {/* Artist Drawer */}
      <ArtistDrawer
        artist={selectedArtist}
        open={artistDrawerOpen}
        onClose={() => { setArtistDrawerOpen(false); setSelectedArtist(null); }}
        isOwner={isOwner}
      />
    </div>
  );
}