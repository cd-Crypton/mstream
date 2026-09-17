import React, { useState, useEffect } from "react";
import { useTMDB } from "../hooks/useTMDB";
import { PlayIcon, InfoIcon, StarIcon } from "./Icons";

const BannerSlider = ({ movies, onItemClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { BACKDROP_URL } = useTMDB();

  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!movies || !movies.length) return null;

  const currentMovie = movies[currentSlide];
  if (!currentMovie) return null;

  const title = currentMovie.title || currentMovie.name;
  const year =
    currentMovie.release_date?.substring(0, 4) ||
    currentMovie.first_air_date?.substring(0, 4) ||
    "";
  const rating = currentMovie.vote_average
    ? currentMovie.vote_average.toFixed(1)
    : null;

  return (
    <div className="banner-slider">
      {movies.map((movie, index) => {
        const isCurrent = index === currentSlide;
        const bgUrl = movie.backdrop_path
          ? `${BACKDROP_URL}${movie.backdrop_path}`
          : "";

        return (
          <div
            key={movie.id}
            className={`banner-slide ${isCurrent ? "active" : ""}`}
            style={{
              backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
            }}
          >
            {isCurrent && (
              <div className="banner-content">
                <div className="now-playing-overlay">
                  <span className="now-playing-badge">
                    <span className="now-playing-dot" />
                    Now Showing
                  </span>
                </div>

                <h1 className="banner-title">{title}</h1>

                <div className="banner-meta">
                  {rating && (
                    <span className="rating">
                      <StarIcon size={14} fill="currentColor" />
                      {rating}
                    </span>
                  )}
                  {year && <span className="year">{year}</span>}
                  <span className="year">HD</span>
                </div>

                <p className="banner-description">{currentMovie.overview}</p>

                <div className="banner-buttons">
                  <a
                    href={`/watch?type=${currentMovie.media_type || "movie"}&id=${currentMovie.id}`}
                    className="btn btn-primary"
                  >
                    <PlayIcon size={18} />
                    Play Now
                  </a>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onItemClick(currentMovie)}
                  >
                    <InfoIcon size={18} />
                    More Info
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="banner-dots">
        {movies.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`banner-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
