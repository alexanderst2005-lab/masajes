import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function ReviewsSection({ lang = 'es' }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam hidden field

  const isEs = lang === 'es';

  const t = {
    title: isEs ? 'Reseñas de nuestros clientes' : 'Client Reviews',
    subtitle: isEs 
      ? 'Experiencias reales de quienes han disfrutado de nuestros masajes en Sint Maarten' 
      : 'Real experiences from those who have enjoyed our mobile massages in Sint Maarten',
    formTitle: isEs ? 'Comparte tu experiencia' : 'Share Your Experience',
    formSubtitle: isEs 
      ? 'Tu opinión es muy valiosa para nosotros y se publicará automáticamente.' 
      : 'Your feedback means the world to us and will be published immediately.',
    nameLabel: isEs ? 'Tu nombre o iniciales' : 'Your name or initials',
    ratingLabel: isEs ? 'Tu calificación' : 'Your rating',
    commentLabel: isEs ? 'Tu comentario sobre el servicio recibido' : 'Your comment about the service',
    commentPlaceholder: isEs 
      ? 'Cuéntanos cómo fue tu experiencia de masaje, el ambiente, la atención...' 
      : 'Tell us how your massage experience was, the atmosphere, the therapist...',
    submitBtn: isEs ? 'Publicar mi reseña' : 'Publish My Review',
    submittingBtn: isEs ? 'Publicando...' : 'Publishing...',
    success: isEs 
      ? '¡Muchas gracias! Tu reseña ha sido publicada con éxito.' 
      : 'Thank you so much! Your review has been published successfully.',
    noReviews: isEs 
      ? 'Aún no hay reseñas registradas. ¡Sé la primera persona en compartir tu experiencia!' 
      : 'No reviews yet. Be the first one to share your experience!',
    average: isEs ? 'Promedio de satisfacción' : 'Average Rating',
    basedOn: isEs ? 'opiniones' : 'reviews',
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error fetching reviews:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg(isEs ? 'Por favor escribe tu nombre (mínimo 2 letras).' : 'Please enter your name (at least 2 characters).');
      return;
    }
    if (!comment.trim() || comment.trim().length < 4) {
      setErrorMsg(isEs ? 'Por favor escribe un comentario sobre tu experiencia.' : 'Please write a brief comment.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          comment: comment.trim(),
          honeypot
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isEs ? 'Error al enviar la reseña' : 'Error submitting review'));
      }

      // Add instantly to list without needing refresh
      if (data.review) {
        setReviews(prev => [data.review, ...prev]);
      }

      setSuccessMsg(t.success);
      setName('');
      setComment('');
      setRating(5);
      
      // Auto clear success msg after 8s
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      setErrorMsg(err.message || (isEs ? 'Ocurrió un error. Intenta de nuevo.' : 'An error occurred. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Compute average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section id="reviews" className="reviews-section fade-in">
      <div className="container">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-subtitle">{t.subtitle}</p>

        {/* Rating summary bar if reviews exist */}
        {avgRating && (
          <div className="reviews-summary-badge">
            <div className="summary-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={22}
                  fill={s <= Math.round(avgRating) ? '#C4A77D' : 'none'}
                  color="#C4A77D"
                />
              ))}
            </div>
            <div className="summary-text">
              <strong>{avgRating} / 5.0</strong> — {reviews.length} {t.basedOn}
            </div>
          </div>
        )}

        <div className="reviews-container-grid">
          {/* Submit Review Card */}
          <div className="review-form-card">
            <div className="review-form-header">
              <MessageSquare size={24} color="var(--color-primary)" />
              <div>
                <h3>{t.formTitle}</h3>
                <p>{t.formSubtitle}</p>
              </div>
            </div>

            {successMsg && (
              <div className="review-alert review-alert-success">
                <CheckCircle size={20} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="review-alert review-alert-error">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
              {/* Anti-spam honeypot (hidden from real users) */}
              <input
                type="text"
                name="user_website_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="form-group">
                <label>{t.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isEs ? 'Ej. María G. o Carlos' : 'e.g. Maria G. or Charles'}
                  maxLength={70}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.ratingLabel}</label>
                <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="star-btn"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`${star} estrellas`}
                    >
                      <Star
                        size={30}
                        fill={(hoverRating || rating) >= star ? '#C4A77D' : 'transparent'}
                        color="#C4A77D"
                      />
                    </button>
                  ))}
                  <span className="rating-num-label">
                    {(hoverRating || rating)} / 5
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>{t.commentLabel}</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.commentPlaceholder}
                  rows="4"
                  maxLength={1000}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary submit-review-btn"
              >
                {submitting ? (
                  <span>{t.submittingBtn}</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{t.submitBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of reviews */}
          <div className="reviews-list-wrapper">
            {loading ? (
              <div className="reviews-loading">
                <div className="spinner"></div>
                <p>{isEs ? 'Cargando reseñas...' : 'Loading reviews...'}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty-state">
                <MessageSquare size={48} color="var(--color-primary)" opacity={0.6} />
                <p>{t.noReviews}</p>
              </div>
            ) : (
              <div className="reviews-feed">
                {reviews.map((rev) => {
                  const dateStr = rev.created_at
                    ? new Date(rev.created_at).toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : '';

                  return (
                    <div key={rev.id} className="customer-review-card">
                      <div className="customer-review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h4 className="reviewer-name">{rev.name}</h4>
                            {dateStr && <span className="reviewer-date">{dateStr}</span>}
                          </div>
                        </div>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={17}
                              fill={s <= rev.rating ? '#C4A77D' : 'none'}
                              color="#C4A77D"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="customer-review-body">{rev.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
