import React from "react";

export default function Stars({ rating, reviews }) {
  const stars = "★★★★★";
  const filled = Math.round((rating || 0) / 1);
  return (
    <span className="rating">
      <span className="stars">
        {stars.slice(0, filled)}
        <span style={{ opacity: 0.25 }}>{stars.slice(filled)}</span>
      </span>
      {rating ? <b>{rating.toFixed(1)}</b> : null}
      {reviews != null && <span>({reviews.toLocaleString()})</span>}
    </span>
  );
}
