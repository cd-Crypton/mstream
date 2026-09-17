import { useTMDB } from "../hooks/useTMDB";
import { useLibrary } from "../context/LibraryContext";
import {
  StarIcon,
  PlayIcon,
  FilmIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
} from "./Icons";

const MovieCard = ({ item, onClick }) => {
  const { POSTER_URL } = useTMDB();
  const { isInLibrary, toggleLibrary } = useLibrary();

  const title = item.title || item.name;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const mediaType =
    item.media_type || item.type || (item.first_air_date ? "tv" : "movie");
  const inLib = isInLibrary(item.id, mediaType);
  const year = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
      ? item.first_air_date.substring(0, 4)
      : "";

  const posterSrc = item.poster_path
    ? `${POSTER_URL}${item.poster_path}`
    : null;

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    toggleLibrary(item);
  };

  return (
    <div
      className="movie-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="card-image-container">
        {posterSrc ? (
          <img src={posterSrc} alt={title} loading="lazy" />
        ) : (
          <div className="poster-placeholder">
            <FilmIcon size={28} className="poster-placeholder-icon" />
            <span>{title}</span>
          </div>
        )}

        <button
          type="button"
          className={`card-bookmark-btn ${inLib ? "in-library" : ""}`}
          onClick={handleBookmarkClick}
          aria-label={inLib ? "Remove from Library" : "Add to Library"}
          title={inLib ? "Remove from Library" : "Add to Library"}
        >
          {inLib ? <BookmarkCheckIcon size={15} /> : <BookmarkIcon size={15} />}
        </button>

        <div className="card-hover-overlay">
          <button
            type="button"
            className="play-hover-btn"
            tabIndex={-1}
            aria-hidden="true"
          >
            <PlayIcon size={14} />
            Play
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title" title={title}>
          {title}
        </h3>
        <div className="card-meta">
          {rating ? (
            <span className="rating">
              <StarIcon size={13} fill="currentColor" />
              {rating}
            </span>
          ) : (
            <span className="rating" style={{ color: "var(--text-muted)" }}>
              NR
            </span>
          )}
          {year && <span className="year">{year}</span>}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
