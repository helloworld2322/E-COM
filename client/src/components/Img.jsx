import { useState } from "react";

const EMOJI = {
  electronics: "📱",
  fashion: "👟",
  home: "🪴",
  beauty: "🧴",
  sports: "🏃",
  accessories: "⌚",
};

export default function Img({ src, alt, category = "", className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <span>{EMOJI[category] || "🛍️"}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
