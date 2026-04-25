import { useState } from "react";
import { Camera, ChevronUp, ChevronDown } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MediaSection from "./MediaSection";
import CharacterList from "./CharacterList";
import ShipList from "./ShipList";
import TropeStrip from "./TropeStrip";
import SocialLinks from "./SocialLinks";
import MediaModal from "./MediaModal";
import FandomsSection from "./FandomsSection";

const MEDIA_SECTION_TYPES = [
  "tv_show", "movie", "documentary", "book", "artist",
  "podcast", "video_game", "anime", "fanfiction", "creator",
];

// ─── Reorder wrapper (edit mode only) ────────────────────────────────────────

function ReorderableSection({ sectionKey, sectionOrder, onReorder, isOwner, dragHandleProps, children }) {
  if (!isOwner || !onReorder) return <>{children}</>;

  const idx = sectionOrder.indexOf(sectionKey);
  const total = sectionOrder.length;

  const moveUp = (e) => {
    e.stopPropagation();
    if (idx <= 0) return;
    const next = [...sectionOrder];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onReorder(next);
  };

  const moveDown = (e) => {
    e.stopPropagation();
    if (idx >= total - 1) return;
    const next = [...sectionOrder];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onReorder(next);
  };

  return (
    <div className="relative group/section">
      {/* Drag handle - invisible full-width strip at top of section */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute top-0 left-0 right-0 h-8 z-20 cursor-grab active:cursor-grabbing opacity-0 group-hover/section:opacity-100 transition-opacity"
          title="drag to reorder"
        />
      )}
      {children}
      {/* Up / down arrow buttons */}
      <div className="absolute top-14 right-6 md:right-14 opacity-0 group-hover/section:opacity-100 transition-opacity flex flex-col gap-1 z-20">
        {idx > 0 && (
          <button
            onClick={moveUp}
            className="w-7 h-7 flex items-center justify-center bg-background border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}
        {idx < total - 1 && (
          <button
            onClick={moveDown}
            className="w-7 h-7 flex items-center justify-center bg-background border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileDisplayView({
  profile,
  isOwner = false,
  editKey,
  onSaveMedia,
  onSaveCharacter,
  onSaveShip,
  onSaveTag,
  onSaveSocialLink,
  onSaveFandom,
  onReorderSections,
}) {
  const [modalItem, setModalItem] = useState(null);

  const mediaItems   = profile.media_items   || [];
  const characters   = profile.characters    || [];
  const ships        = profile.ships         || [];
  const tags         = profile.tags          || [];
  const socialLinks  = profile.social_links  || [];
  const fandoms      = profile.fandoms       || [];
  const fandomSpaces = profile.fandom_spaces || [];
  const enabledSections = profile.enabled_sections || [];

  const orderedSections = enabledSections.length > 0
    ? enabledSections
    : [...MEDIA_SECTION_TYPES, "characters", "ships", "tags", "social_links"];

  const itemsByType = (type) => mediaItems.filter((m) => m.media_type === type);

  const handleCardClick = (item) => {
    const opensExternalLink = (item.media_type === "creator" || item.media_type === "fanfiction") && item.link;
    if (opensExternalLink) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }
    setModalItem(item);
  };

  const handleModalSave = (updatedItem) => {
    onSaveMedia?.("update", updatedItem);
    setModalItem(updatedItem);
  };

  const renderSection = (sectionKey) => {
    if (MEDIA_SECTION_TYPES.includes(sectionKey)) {
      const items = itemsByType(sectionKey);
      if (items.length === 0 && !isOwner) return null;
      return (
        <MediaSection
          key={sectionKey}
          mediaType={sectionKey}
          items={items}
          onCardClick={handleCardClick}
          onAdd={isOwner ? (item) => onSaveMedia?.("add", item) : undefined}
          onDelete={isOwner ? (id) => onSaveMedia?.("delete", id) : undefined}
          onReorder={isOwner ? (reordered) => onSaveMedia?.("reorder", { mediaType: sectionKey, items: reordered }) : undefined}
          isOwner={isOwner}
        />
      );
    }

    if (sectionKey === "characters") {
      if (characters.length === 0 && !isOwner) return null;
      return (
        <CharacterList
          key="characters"
          characters={characters}
          isOwner={isOwner}
          onAdd={isOwner ? (c) => onSaveCharacter?.("add", c) : undefined}
          onDelete={isOwner ? (id) => onSaveCharacter?.("delete", id) : undefined}
        />
      );
    }

    if (sectionKey === "ships") {
      if (ships.length === 0 && !isOwner) return null;
      return (
        <ShipList
          key="ships"
          ships={ships}
          isOwner={isOwner}
          onAdd={isOwner ? (s) => onSaveShip?.("add", s) : undefined}
          onDelete={isOwner ? (id) => onSaveShip?.("delete", id) : undefined}
        />
      );
    }

    if (sectionKey === "tags") {
      if (tags.length === 0 && !isOwner) return null;
      return (
        <TropeStrip
          key="tags"
          tags={tags}
          isOwner={isOwner}
          onAdd={isOwner ? (t) => onSaveTag?.("add", t) : undefined}
          onDelete={isOwner ? (id) => onSaveTag?.("delete", id) : undefined}
        />
      );
    }

    if (sectionKey === "social_links") {
      if (socialLinks.length === 0 && !isOwner) return null;
      return (
        <SocialLinks
          key="social_links"
          links={socialLinks}
          isOwner={isOwner}
          onAdd={isOwner ? (l) => onSaveSocialLink?.("add", l) : undefined}
          onDelete={isOwner ? (id) => onSaveSocialLink?.("delete", id) : undefined}
        />
      );
    }

    if (sectionKey === "fandoms") {
      if (fandoms.length === 0 && fandomSpaces.length === 0 && !isOwner) return null;
      return (
        <FandomsSection
          key="fandoms"
          fandoms={fandoms}
          fandomSpaces={fandomSpaces}
          isOwner={isOwner}
          onAddFandom={isOwner ? (f) => onSaveFandom?.("addFandom", f) : undefined}
          onDeleteFandom={isOwner ? (id) => onSaveFandom?.("deleteFandom", id) : undefined}
          onAddSpace={isOwner ? (s) => onSaveFandom?.("addSpace", s) : undefined}
          onDeleteSpace={isOwner ? (s) => onSaveFandom?.("deleteSpace", s) : undefined}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero masthead */}
      <section className="min-h-[65vh] flex items-end pb-16 md:pb-24 relative pt-16">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">
            <div className="flex-shrink-0">
              <div className="w-36 h-52 md:w-48 overflow-hidden rounded-sm bg-muted" style={{ aspectRatio: "2/3" }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 pt-2">
              <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-3">fanfolio</p>
              <h1
                className="font-heading font-light tracking-tight leading-none text-foreground"
                style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
              >
                {profile.username || "untitled archive"}
              </h1>
              {profile.tagline && (
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mt-5">{profile.tagline}</p>
              )}
              {profile.bio && (
                <p className="font-body text-base md:text-lg text-muted-foreground mt-5 max-w-lg leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-border" />
      </section>

      {/* Sections in user-defined order */}
      {isOwner && onReorderSections ? (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) return;
            const next = Array.from(orderedSections);
            const [moved] = next.splice(result.source.index, 1);
            next.splice(result.destination.index, 0, moved);
            onReorderSections(next);
          }}
        >
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {orderedSections.map((sectionKey, idx) => {
                  const sectionContent = renderSection(sectionKey);
                  if (!sectionContent) return null;
                  return (
                    <Draggable key={sectionKey} draggableId={sectionKey} index={idx}>
                      {(drag, snapshot) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={snapshot.isDragging ? "opacity-80 shadow-2xl" : ""}
                        >
                          <ReorderableSection
                            sectionKey={sectionKey}
                            sectionOrder={orderedSections}
                            onReorder={onReorderSections}
                            isOwner={isOwner}
                            dragHandleProps={drag.dragHandleProps}
                          >
                            {sectionContent}
                          </ReorderableSection>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        orderedSections.map((sectionKey) => {
          const sectionContent = renderSection(sectionKey);
          if (!sectionContent) return null;
          return (
            <ReorderableSection
              key={sectionKey}
              sectionKey={sectionKey}
              sectionOrder={orderedSections}
              onReorder={undefined}
              isOwner={false}
            >
              {sectionContent}
            </ReorderableSection>
          );
        })
      )}

      <footer className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            fanfolio - a curated taste archive
          </p>
        </div>
      </footer>

      {/* Media detail modal */}
      {modalItem && (
        <MediaModal
          item={modalItem}
          isOwner={isOwner}
          onClose={() => setModalItem(null)}
          onSave={handleModalSave}
          profileId={profile.profile_id}
          editKey={editKey}
        />
      )}
    </div>
  );
}