import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function MediaCard({ item, onClick, index = 0 }) {
  const hasLink = item.media_type === "fanfiction" && item.link;

  const handleClick = () => {
    if (hasLink) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else if (onClick) {
      onClick(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group cursor-pointer flex-shrink-0 w-36 md:w-44"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="font-heading text-4xl text-muted-foreground opacity-40">
              {item.title?.[0]}
            </span>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {hasLink && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p className="font-body text-sm font-medium text-foreground leading-tight line-clamp-2">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground mt-0.5 truncate">
            {item.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}