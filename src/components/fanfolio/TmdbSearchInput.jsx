import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTmdbSearch } from "@/hooks/useTmdbSearch";

const TMDB_TYPES = ["tv_show", "movie", "documentary", "anime"];

export default function TmdbSearchInput({ mediaType, value, onChange, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const isTmdb = TMDB_TYPES.includes(mediaType);
  const { results, loading } = useTmdbSearch(isTmdb ? mediaType : null, value);

  useEffect(() => {
    setOpen(isTmdb && results.length > 0 && value.length >= 2);
  }, [results, value, isTmdb]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-2 top-2">
          <div className="w-3 h-3 border border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-sm shadow-lg overflow-hidden">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left"
            >
              {item.image_url
                ? <img src={item.image_url} alt="" className="w-6 h-9 object-cover rounded-[2px] flex-shrink-0" />
                : <div className="w-6 h-9 bg-muted rounded-[2px] flex-shrink-0" />
              }
              <div className="min-w-0">
                <p className="font-body text-sm truncate">{item.title}</p>
                {item.subtitle && <p className="font-mono text-[10px] text-muted-foreground">{item.subtitle}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}