"use client";
import { useState } from "react";
import WhatsAppButton from "./WhatsAppButton";

export default function ProductCard({ product, whatsappNumber }) {
  const images = product.images && product.images.length ? product.images : (product.image_url ? [{ url: product.image_url }] : []);
  const [activeImg, setActiveImg] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasDescription = !!(product.description && product.description.trim());
  const hasMultipleImages = images.length > 1;
  const hasVideo = !!product.video_url;

  function toggleExpanded(e) {
    // Usifunge/usifungue kama mtumiaji amebonyeza kitufe/kidole cha ndani (thumbnail, video, WhatsApp)
    if (e.target.closest("[data-no-toggle]")) return;
    setExpanded((v) => !v);
  }

  return (
    <div className={`card product-card ${expanded ? "product-card-open" : ""}`}>
      <div className="card-media">
        {product.badge && (
          <span className={`badge badge-${product.badge}`}>
            {product.badge === "mpya" ? "MPYA" : "INAYOPENDWA"}
          </span>
        )}
        {images.length > 0 && (
          <span className="pic-count-badge">📷 {images.length}</span>
        )}
        <div
          className="img-wrap product-media-btn"
          onClick={toggleExpanded}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleExpanded(e)}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
        >
          {showVideo && hasVideo ? (
            <video
              src={product.video_url}
              controls
              autoPlay
              playsInline
              data-no-toggle
              onClick={(e) => e.stopPropagation()}
            />
          ) : images.length > 0 ? (
            <img
              src={images[activeImg]?.url}
              alt={product.name}
              loading="lazy"
              className="fade-in-img"
            />
          ) : (
            <div className="no-image-placeholder">Hakuna picha</div>
          )}

          {hasVideo && (
            <span
              className="video-play-btn"
              data-no-toggle
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo((v) => !v);
              }}
              role="button"
              aria-label={showVideo ? "Funga video" : "Cheza video"}
            >
              {showVideo ? "✕" : "▶"}
            </span>
          )}

          <span className="expand-hint" aria-hidden="true">{expanded ? "▲" : "▼"}</span>
        </div>

        {hasMultipleImages && !showVideo && (
          <div className="thumb-strip" data-no-toggle>
            {images.map((img, i) => (
              <button
                type="button"
                key={img.id || i}
                className={`thumb-dot ${i === activeImg ? "thumb-dot-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg(i);
                }}
                aria-label={`Picha ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card-body" onClick={toggleExpanded}>
        <h3>{product.name}</h3>
        <p className="price">{Number(product.price).toLocaleString("sw-TZ")} TZS</p>

        {hasDescription && (
          <p className={`small muted product-desc ${expanded ? "product-desc-open" : "product-desc-clamp"}`}>
            {product.description}
          </p>
        )}

        {hasDescription && (
          <button
            type="button"
            className="desc-toggle-link"
            data-no-toggle
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? "Punguza ▲" : "Soma Zaidi ▼"}
          </button>
        )}

        <div className="mt-8" data-no-toggle onClick={(e) => e.stopPropagation()}>
          <WhatsAppButton number={whatsappNumber} itemName={product.name} />
        </div>
      </div>
    </div>
  );
}
