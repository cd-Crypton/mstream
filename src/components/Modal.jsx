import { useCallback, useEffect, memo } from "react";
import { useTMDB } from "../hooks/useTMDB";
import { useLibrary } from "../context/LibraryContext";
import {
  CloseIcon,
  PlayIcon,
  StarIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
} from "./Icons";

const Modal = memo(({ item, onClose }) => {
  const { POSTER_URL } = useTMDB();
  const { isInLibrary, toggleLibrary } = useLibrary();

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const targetType =
    item?.type || item?.media_type || (item?.first_air_date ? "tv" : "movie");

  const inLib = item ? isInLibrary(item.id, targetType) : false;

  const playButtonClick = useCallback(() => {
    window.location.href = `/watch?type=${targetType}&id=${item.id}`;
  }, [item, targetType]);

  if (!item) return null;

  const title = item.title || item.name;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const genres = Array.isArray(item.genres) ? item.genres : [];

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <CloseIcon size={20} />
        </button>

        <div className="modal-body">
          {item.poster_path ? (
            <img
              src={`${POSTER_URL}${item.poster_path}`}
              alt={title}
              className="modal-poster"
              loading="lazy"
            />
          ) : (
            <div className="modal-poster poster-placeholder">
              <span>{title}</span>
            </div>
          )}

          <div className="modal-details">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>

            <div className="modal-meta">
              {rating && (
                <div className="rating-badge">
                  <StarIcon size={15} fill="currentColor" />
                  <span>{rating} / 10</span>
                </div>
              )}
              {item.release_date && (
                <span className="genre-tag">
                  {item.release_date.substring(0, 4)}
                </span>
              )}
              {item.first_air_date && (
                <span className="genre-tag">
                  {item.first_air_date.substring(0, 4)}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="genre-tags">
                {genres.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="modal-description">
              {item.overview || "No overview available for this title."}
            </p>

            <div className="modal-extra-info">
              {item.cast && item.cast !== "N/A" && (
                <div className="info-row">
                  <strong>Cast:</strong>
                  <span>{item.cast}</span>
                </div>
              )}
              <div className="info-row">
                <strong>Type:</strong>
                <span style={{ textTransform: "uppercase" }}>
                  {item.type || item.media_type || "Movie"}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={playButtonClick}
                className="watch-btn primary"
              >
                <PlayIcon size={18} />
                Watch Now
              </button>
              <button
                type="button"
                onClick={() => toggleLibrary(item)}
                className={`watch-btn ${inLib ? "primary" : "secondary"}`}
                style={{
                  background: inLib
                    ? "var(--brand-primary)"
                    : "rgba(255, 255, 255, 0.08)",
                  border: inLib
                    ? "1px solid var(--brand-hover)"
                    : "1px solid var(--border-default)",
                  color: "#ffffff",
                }}
              >
                {inLib ? (
                  <>
                    <BookmarkCheckIcon size={18} />
                    In Library
                  </>
                ) : (
                  <>
                    <BookmarkIcon size={18} />
                    Add to Library
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";
export default Modal;
