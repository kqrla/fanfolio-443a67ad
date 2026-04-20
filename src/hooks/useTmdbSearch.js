import { useState, useEffect, useRef } from "react";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = import.meta.env.VITE_SECRET_TMDB_API_KEY;

// Map our media types to TMDB search endpoints
const TYPE_MAP = {
  tv_show:     "tv",
  movie:       "movie",
  documentary: "movie",
  anime:       "tv",
};

export function useTmdbSearch(mediaType, query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const tmdbType = TYPE_MAP[mediaType];
    if (!tmdbType || !query || query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          api_key: TMDB_KEY,
          query,
          ...(mediaType === "anime" ? { with_genres: "16", with_origin_country: "JP" } : {}),
          ...(mediaType === "documentary" ? { with_genres: "99" } : {}),
        });
        const res = await fetch(`${TMDB_BASE}/search/${tmdbType}?${params}`);
        const data = await res.json();
        setResults((data.results || []).slice(0, 6).map((item) => ({
          id: item.id,
          title: item.title || item.name,
          subtitle: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "",
          image_url: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "",
        })));
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [mediaType, query]);

  return { results, loading };
}