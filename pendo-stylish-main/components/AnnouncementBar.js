"use client";

import { useState } from "react";

export default function AnnouncementBar({ text, linkHref, linkLabel }) {
  const [visible, setVisible] = useState(true);
  if (!visible || !text) return null;

  return (
    <div className="announcement-bar">
      <span>{text}</span>
      {linkHref && linkLabel && (
        <a href={linkHref} className="announcement-link">
          {linkLabel}
        </a>
      )}
      <button
        type="button"
        className="announcement-close"
        aria-label="Funga tangazo"
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </div>
  );
}
