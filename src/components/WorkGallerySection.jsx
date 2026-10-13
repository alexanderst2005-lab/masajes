import React, { useState, useEffect } from 'react';
import { Play, Maximize2, X, Image as ImageIcon, Video as VideoIcon, ChevronDown } from 'lucide-react';

export default function WorkGallerySection({ lang = 'es' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeMedia, setActiveMedia] = useState(null); // Lightbox modal item

  const isEs = lang === 'es';

  const t = {
    title: isEs ? 'Nuestro Trabajo' : 'Our Work',
    subtitle: isEs
      ? 'Fotografías y videos de nuestras sesiones, tratamientos y experiencias exclusivas en villas, hoteles y yates de Sint Maarten'
      : 'Photos and videos of our massage sessions, treatments, and exclusive wellness experiences across Sint Maarten villas, hotels & yachts',
    loadMore: isEs ? 'Ver más publicaciones' : 'Show more photos & videos',
    noItems: isEs
      ? 'Pronto compartiremos nuevas fotografías y videos de nuestras sesiones.'
      : 'New photos and videos of our sessions will be published here soon.',
    videoTag: isEs ? 'Video' : 'Video',
    photoTag: isEs ? 'Foto' : 'Photo',
    close: isEs ? 'Cerrar' : 'Close',
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error fetching gallery:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Prevent background scroll when lightbox is open and allow closing with Esc
  useEffect(() => {
    if (!activeMedia) {
      document.body.style.overflow = 'auto';
      return undefined;
    }
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMedia(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeMedia]);

  const displayedItems = items.slice(0, visibleCount);

  return (
    <section id="work-gallery" className="work-gallery-section fade-in">
      <div className="container">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-subtitle">{t.subtitle}</p>

        {loading ? (
          <div className="gallery-loading">
            <div className="spinner"></div>
            <p>{isEs ? 'Cargando galería...' : 'Loading gallery...'}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="gallery-empty-state">
            <ImageIcon size={48} color="var(--color-primary)" opacity={0.6} />
            <p>{t.noItems}</p>
          </div>
        ) : (
          <>
            <div className="work-cards-grid">
              {displayedItems.map((item) => {
                const isVideo = item.media_type === 'video';

                return (
                  <div
                    key={item.id}
                    className="work-card"
                    onClick={() => setActiveMedia(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title || (isVideo ? 'Video' : 'Fotografía')}
                  >
                    <div className="work-card-media-wrapper">
                      {isVideo ? (
                        <div className="work-card-video-thumb">
                          <video
                            src={item.url}
                            preload="metadata"
                            muted
                            playsInline
                            className="work-card-media"
                          />
                          <div className="work-card-play-overlay">
                            <div className="play-button-circle">
                              <Play size={22} fill="white" color="white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || 'Sesión de masaje'}
                          loading="lazy"
                          className="work-card-media"
                        />
                      )}

                      <div className="media-badge">
                        {isVideo ? (
                          <>
                            <VideoIcon size={13} />
                            <span>{t.videoTag}</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={13} />
                            <span>{t.photoTag}</span>
                          </>
                        )}
                      </div>

                      <div className="work-card-zoom-icon">
                        <Maximize2 size={18} color="white" />
                      </div>
                    </div>

                    {(item.title || item.description) && (
                      <div className="work-card-info">
                        {item.title && <h3 className="work-card-title">{item.title}</h3>}
                        {item.description && (
                          <p className="work-card-desc">{item.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more button */}
            {visibleCount < items.length && (
              <div className="work-gallery-more-container">
                <button
                  type="button"
                  className="btn btn-outline load-more-btn"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                >
                  <span>{t.loadMore}</span>
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox / Video Player Modal */}
      {activeMedia && (
        <div
          className="media-modal-backdrop"
          onClick={() => setActiveMedia(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="media-modal-close-btn"
              onClick={() => setActiveMedia(null)}
              aria-label={t.close}
            >
              <X size={26} />
            </button>

            <div className="media-modal-display">
              {activeMedia.media_type === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="media-modal-video"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title || 'Foto ampliada'}
                  className="media-modal-image"
                />
              )}
            </div>

            {(activeMedia.title || activeMedia.description) && (
              <div className="media-modal-caption">
                {activeMedia.title && <h4>{activeMedia.title}</h4>}
                {activeMedia.description && <p>{activeMedia.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
