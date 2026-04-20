import { useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MediaCard from "./MediaCard";
import AddMediaDialog from "./AddMediaDialog";

const SECTION_LABELS = {
  tv_show:     "favorite tv shows",
  movie:       "favorite movies",
  documentary: "favorite documentaries",
  book:        "favorite books",
  artist:      "favorite artists",
  podcast:     "favorite podcasts",
  video_game:  "favorite video games",
  anime:       "favorite anime",
  fanfiction:  "favorite fanfiction",
  creator:     "creators",
};

export default function MediaSection({ mediaType, items, onCardClick, onAdd, onDelete, onReorder, isOwner }) {
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const label = SECTION_LABELS[mediaType] || mediaType;
  const displayItems = expanded ? items : items.slice(0, 4);
  const hasMore = items.length > 4;

  const handleDragEnd = (result) => {
    if (!result.destination || !onReorder) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorder(reordered);
  };

  if (items.length === 0 && !isOwner) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight">{label}</h2>
            <div className="h-px w-16 bg-primary mt-3" />
          </div>
          <div className="flex items-center gap-4">
            {isOwner && (
              <button
                onClick={() => setAddOpen(true)}
                className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> add
              </button>
            )}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {expanded
                  ? <>collapse <X className="w-3 h-3" /></>
                  : <>explore full archive [{items.length.toString().padStart(2, "0")}] <ChevronRight className="w-3 h-3" /></>
                }
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        {items.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground tracking-wider py-10">
            no items yet — add your first.
          </p>
        ) : isOwner && onReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`media-${mediaType}`} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={expanded
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                    : "flex gap-6 overflow-x-auto hide-scrollbar pb-2"
                  }
                >
                  {displayItems.map((item, i) => (
                    <Draggable key={item.id} draggableId={item.id} index={i}>
                      {(drag, snapshot) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          className={`relative group/card flex-shrink-0 ${snapshot.isDragging ? "opacity-80 scale-105" : ""} transition-transform`}
                        >
                          <MediaCard item={item} index={i} onClick={() => !snapshot.isDragging && onCardClick?.(item)} />
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <motion.div
            key={expanded ? "grid" : "row"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={
              expanded
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                : "flex gap-6 overflow-x-auto hide-scrollbar pb-2"
            }
          >
            {displayItems.map((item, i) => (
              <div key={item.id} className="relative group/card">
                <MediaCard item={item} index={i} onClick={() => onCardClick?.(item)} />
                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="h-px bg-border" />
      </div>

      {isOwner && (
        <AddMediaDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mediaType={mediaType}
          onAdd={onAdd}
        />
      )}
    </section>
  );
}