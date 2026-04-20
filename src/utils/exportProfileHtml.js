import JSZip from "jszip";

const SECTION_LABELS = {
  tv_show: "Favorite TV Shows", movie: "Favorite Movies", documentary: "Documentaries",
  book: "Favorite Books", artist: "Favorite Artists", podcast: "Favorite Podcasts",
  video_game: "Favorite Video Games", anime: "Favorite Anime", fanfiction: "Favorite Fanfiction",
  creator: "Creators",
};

const MEDIA_TYPES = ["tv_show", "movie", "documentary", "book", "artist", "podcast", "video_game", "anime", "fanfiction", "creator"];

function mediaCard(item) {
  return `
    <div class="card">
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" />` : `<div class="card-placeholder"></div>`}
      <p class="card-title">${item.title}</p>
      ${item.subtitle ? `<p class="card-sub">${item.subtitle}</p>` : ""}
    </div>`;
}

function buildHtml(profile) {
  const enabled = profile.enabled_sections || MEDIA_TYPES;
  const mediaItems = profile.media_items || [];

  const mediaSections = MEDIA_TYPES.filter(t => enabled.includes(t)).map(type => {
    const items = mediaItems.filter(i => i.media_type === type);
    if (!items.length) return "";
    return `
      <section class="section">
        <h2>${SECTION_LABELS[type]}</h2>
        <div class="cards">${items.map(mediaCard).join("")}</div>
      </section>`;
  }).join("");

  const characters = (profile.characters || []);
  const ships = (profile.ships || []);
  const tags = (profile.tags || []);
  const socialLinks = (profile.social_links || []);

  const charSection = enabled.includes("characters") && characters.length ? `
    <section class="section">
      <h2>Favorite Characters</h2>
      <div class="tags">${characters.map(c => `<span class="tag" title="from ${c.source}">${c.name}</span>`).join("")}</div>
    </section>` : "";

  const shipSection = enabled.includes("ships") && ships.length ? `
    <section class="section">
      <h2>Favorite Ships</h2>
      <ul class="list">${ships.map(s => `<li><strong>${s.name}</strong>${s.show ? ` <span class="dim">— ${s.show}</span>` : ""}</li>`).join("")}</ul>
    </section>` : "";

  const tagSection = enabled.includes("tags") && tags.length ? `
    <section class="section">
      <h2>Tropes &amp; Tags</h2>
      <div class="tags">${tags.map(t => `<span class="tag">${t.name} <small>${t.tag_type}</small></span>`).join("")}</div>
    </section>` : "";

  const socialSection = enabled.includes("social_links") && socialLinks.length ? `
    <section class="section">
      <h2>Find Me Elsewhere</h2>
      <div class="socials">${socialLinks.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.platform}</a>`).join("")}</div>
    </section>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${profile.username || "Fanfolio"} — Archive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f7f5f0; color: #1a1a1a; min-height: 100vh; }
    .hero { padding: 80px 40px 60px; max-width: 900px; margin: 0 auto; display: flex; gap: 48px; align-items: flex-end; border-bottom: 1px solid #e0dbd0; }
    .avatar { width: 160px; height: 220px; object-fit: cover; flex-shrink: 0; border-radius: 2px; background: #e0dbd0; }
    .hero-text { flex: 1; }
    .badge { font-family: 'Inter', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #c0392b; margin-bottom: 12px; }
    h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.5rem, 6vw, 5rem); line-height: 1; color: #1a1a1a; }
    .tagline { font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-top: 16px; }
    .bio { font-size: 15px; color: #555; margin-top: 14px; line-height: 1.7; max-width: 480px; }
    .section { max-width: 900px; margin: 0 auto; padding: 48px 40px; border-bottom: 1px solid #e0dbd0; }
    h2 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 2rem; margin-bottom: 8px; }
    h2::after { content: ''; display: block; width: 40px; height: 1px; background: #c0392b; margin-top: 8px; margin-bottom: 24px; }
    .cards { display: flex; gap: 20px; flex-wrap: wrap; }
    .card { width: 120px; flex-shrink: 0; }
    .card img, .card-placeholder { width: 120px; height: 168px; object-fit: cover; border-radius: 2px; background: #e0dbd0; display: block; }
    .card-title { font-size: 12px; margin-top: 6px; font-weight: 500; line-height: 1.3; }
    .card-sub { font-size: 11px; color: #888; margin-top: 2px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 6px 14px; border: 1px solid #e0dbd0; border-radius: 999px; font-size: 13px; }
    .tag small { font-size: 9px; color: #aaa; margin-left: 4px; text-transform: uppercase; }
    .list { list-style: none; space-y: 8px; }
    .list li { padding: 8px 0; border-bottom: 1px solid #e0dbd0; font-size: 14px; }
    .dim { color: #888; font-size: 12px; }
    .socials { display: flex; flex-wrap: wrap; gap: 10px; }
    .socials a { padding: 8px 16px; border: 1px solid #e0dbd0; border-radius: 2px; font-size: 12px; font-family: monospace; text-decoration: none; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.08em; }
    .socials a:hover { border-color: #c0392b; color: #c0392b; }
    footer { max-width: 900px; margin: 0 auto; padding: 40px; }
    footer p { font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; }
    @media (max-width: 600px) { .hero { flex-direction: column; gap: 24px; padding: 48px 20px 32px; } .section { padding: 36px 20px; } footer { padding: 24px 20px; } }
  </style>
</head>
<body>
  <header class="hero">
    ${profile.avatar_url ? `<img class="avatar" src="${profile.avatar_url}" alt="${profile.username}" />` : `<div class="avatar"></div>`}
    <div class="hero-text">
      <p class="badge">fanfolio</p>
      <h1>${profile.username || "Untitled Archive"}</h1>
      ${profile.tagline ? `<p class="tagline">${profile.tagline}</p>` : ""}
      ${profile.bio ? `<p class="bio">${profile.bio}</p>` : ""}
    </div>
  </header>
  ${mediaSections}
  ${charSection}
  ${shipSection}
  ${tagSection}
  ${socialSection}
  <footer><p>fanfolio — a curated taste archive</p></footer>
</body>
</html>`;
}

export async function exportProfileAsZip(profile) {
  const zip = new JSZip();
  const html = buildHtml(profile);
  zip.file("index.html", html);
  zip.file("README.txt", `Fanfolio Export — ${profile.username || "Archive"}\n\nOpen index.html in any browser to view your profile.\nGenerated on ${new Date().toLocaleDateString()}.`);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fanfolio-${profile.username?.toLowerCase().replace(/\s+/g, "-") || "archive"}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}