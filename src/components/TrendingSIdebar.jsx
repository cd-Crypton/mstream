import { StarIcon } from "./Icons";

const TrendingSidebar = ({
  trendingMovies = [],
  trendingTV = [],
  timeWindow = "week",
  onTimeWindowToggle,
  onItemClick,
}) => {
  const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w92${posterPath}`;
  };

  return (
    <div className="trending-sidebar">
      <div className="trending-header">
        <div className="time-toggle-container">
          <button
            type="button"
            className={`time-toggle-btn ${timeWindow === "week" ? "active" : ""}`}
            onClick={() => onTimeWindowToggle("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={`time-toggle-btn ${timeWindow === "day" ? "active" : ""}`}
            onClick={() => onTimeWindowToggle("day")}
          >
            Today
          </button>
        </div>
      </div>

      <div className="trending-columns">
        <div className="trending-column">
          <h3 className="column-title">Trending Movies</h3>
          <div className="trending-list">
            {trendingMovies.slice(0, 5).map((movie) => (
              <div
                key={movie.id}
                className="trending-item"
                onClick={() => onItemClick(movie)}
                role="button"
                tabIndex={0}
              >
                <div className="trending-poster">
                  {getPosterUrl(movie.poster_path) ? (
                    <img
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="trending-info">
                  <div className="trending-name">{movie.title}</div>
                  <div className="trending-meta">
                    <span className="trending-rating">
                      <StarIcon size={12} fill="currentColor" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trending-column">
          <h3 className="column-title">Trending TV Shows</h3>
          <div className="trending-list">
            {trendingTV.slice(0, 5).map((tvShow) => (
              <div
                key={tvShow.id}
                className="trending-item"
                onClick={() => onItemClick(tvShow)}
                role="button"
                tabIndex={0}
              >
                <div className="trending-poster">
                  {getPosterUrl(tvShow.poster_path) ? (
                    <img
                      src={getPosterUrl(tvShow.poster_path)}
                      alt={tvShow.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="trending-info">
                  <div className="trending-name">{tvShow.name}</div>
                  <div className="trending-meta">
                    <span className="trending-rating">
                      <StarIcon size={12} fill="currentColor" />
                      {tvShow.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
