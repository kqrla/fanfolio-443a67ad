const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ArtistDrawer({ artist, open, onClose, isOwner }) {
  const [albums, setAlbums] = useState([]);
  const [adding, setAdding] = useState(false);
  const [albumForm, setAlbumForm] = useState({ album_name: "", album_cover: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && artist) loadAlbums();
  }, [open, artist]);

  const loadAlbums = async () => {
    const data = await db.entities.ArtistAlbum.filter({ artist_name: artist.title });
    setAlbums(data);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setAlbumForm((f) => ({ ...f, album_cover: file_url }));
    setUploading(false);
  };

  const handleAddAlbum = async () => {
    if (!albumForm.album_name.trim()) return;
    await db.entities.ArtistAlbum.create({ artist_name: artist.title, ...albumForm });
    setAlbumForm({ album_name: "", album_cover: "" });
    setAdding(false);
    loadAlbums();
  };

  const handleDeleteAlbum = async (id) => {
    await db.entities.ArtistAlbum.delete(id);
    loadAlbums();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                    Artist Archive
                  </p>
                  <h3 className="font-heading text-4xl font-light mt-2">{artist?.title}</h3>
                  {artist?.subtitle && (
                    <p className="font-mono text-xs text-muted-foreground mt-1">{artist.subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {artist?.image_url && (
                <div className="w-40 aspect-square overflow-hidden rounded-sm mb-10">
                  <img src={artist.image_url} alt={artist.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
                    Albums [{albums.length.toString().padStart(2, "0")}]
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setAdding(!adding)}
                      className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Album
                    </button>
                  )}
                </div>

                {adding && isOwner && (
                  <div className="mb-6 p-4 bg-muted rounded-sm space-y-3">
                    <Input
                      placeholder="Album name"
                      value={albumForm.album_name}
                      onChange={(e) => setAlbumForm((f) => ({ ...f, album_name: e.target.value }))}
                    />
                    <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                    <Button onClick={handleAddAlbum} size="sm" disabled={!albumForm.album_name.trim()}>
                      Save Album
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {albums.map((album) => (
                    <div key={album.id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-sm bg-muted">
                        {album.album_cover ? (
                          <img src={album.album_cover} alt={album.album_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-heading text-2xl text-muted-foreground opacity-40">
                              {album.album_name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="font-body text-sm mt-2">{album.album_name}</p>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {albums.length === 0 && !adding && (
                  <p className="font-mono text-xs text-muted-foreground text-center py-8">
                    No albums added yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}