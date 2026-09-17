import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTMDB } from "../hooks/useTMDB";
import { useLibrary } from "../context/LibraryContext";
import {
  ArrowLeftIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
  FilmIcon,
  TvIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
} from "../components/Icons";

const Watch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const { isInLibrary, toggleLibrary } = useLibrary();

  const [currentServer, setCurrentServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { fetchMovieRecommendations, fetchTVRecommendations } = useTMDB();

  const servers = [
    {
      name: "Server 1",
      getUrl: (s, e) =>
        `https://api.cinezo.net/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
    {
      name: "Server 2",
      getUrl: (s, e) =>
        `https://z.zxcstream.xyz/player/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
    {
      name: "Server 3",
      getUrl: (s, e) =>
        `https://vaplayer.ru/embed/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
    {
      name: "Server 4",
      getUrl: (s, e) =>
        `https://vidplays.fun/embed/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
    {
      name: "Server 5",
      getUrl: (s, e) =>
        `https://vidzen.fun/embed/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
    {
      name: "Server 6",
      getUrl: (s, e) =>
        `https://cinesrc.net/embed/${type}/${id}/${type === "tv" ? `/${s}/${e}` : ""}`,
    },
  ];

  useEffect(() => {
    if (type && id) {
      fetchContentData();
    } else {
      setLoading(false);
    }
  }, [type, id]);

  const fetchContentData = async () => {
    try {
      setLoading(true);

      const contentRes = await fetch(`/api/${type}/${id}`);
      const contentData = await contentRes.json();
      setContentInfo(contentData);

      await fetchRecommendations();

      if (type === "tv") {
        await fetchSeasons();
      }
    } catch (error) {
      console.error("Failed to fetch content data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      let recommendationsData = [];
      if (type === "movie") {
        recommendationsData = await fetchMovieRecommendations(id);
      } else if (type === "tv") {
        recommendationsData = await fetchTVRecommendations(id);
      }
      setRecommendations(recommendationsData.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendations([]);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await fetch(`/api/tv/${id}`);
      const data = await res.json();
      const validSeasons = data.seasons || [];
      setSeasons(validSeasons);

      if (validSeasons.length > 0) {
        setCurrentSeason(validSeasons[0].season_number);
        await fetchEpisodes(validSeasons[0].season_number);
      }
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    try {
      const res = await fetch(`/api/tv/${id}/season/${seasonNumber}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setCurrentEpisode(1);
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
    }
  };

  const handleSeasonChange = async (seasonNumber) => {
    setCurrentSeason(seasonNumber);
    await fetchEpisodes(seasonNumber);
  };

  const getVideoUrl = () => {
    return servers[currentServer].getUrl(currentSeason, currentEpisode);
  };

  const handleRecommendationClick = (recType, recId) => {
    navigate(`/watch?type=${recType}&id=${recId}`);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="watch-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Connecting to cinema stream...</p>
        </div>
      </div>
    );
  }

  if (!type || !id) {
    return (
      <div className="watch-page">
        <div className="error-page">
          <div className="error-content">
            <h1>Content Not Found</h1>
            <p>The requested media stream could not be loaded.</p>
            <button className="back-home-btn" onClick={() => navigate("/")}>
              <ArrowLeftIcon size={18} /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = contentInfo?.title || contentInfo?.name || "Watch";
  const inLib = id ? isInLibrary(id, type) : false;

  return (
    <div className="watch-page">
      {/* Header Bar */}
      <div className="watch-header">
        <div className="watch-header-content">
          <button className="back-browse-btn" onClick={() => navigate("/")}>
            <ArrowLeftIcon size={16} />
            Back to Browse
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="back-browse-btn"
              onClick={() =>
                toggleLibrary({
                  id,
                  type,
                  media_type: type,
                  title,
                  name: title,
                  poster_path: contentInfo?.poster_path,
                  backdrop_path: contentInfo?.backdrop_path,
                  vote_average: contentInfo?.vote_average,
                  release_date:
                    contentInfo?.release_date || contentInfo?.first_air_date,
                  overview: contentInfo?.overview,
                })
              }
              style={{
                background: inLib ? "var(--brand-primary)" : undefined,
                borderColor: inLib ? "var(--brand-hover)" : undefined,
                color: inLib ? "#ffffff" : undefined,
              }}
              title={inLib ? "Remove from Library" : "Add to Library"}
            >
              {inLib ? (
                <>
                  <BookmarkCheckIcon size={16} />
                  In Library
                </>
              ) : (
                <>
                  <BookmarkIcon size={16} />
                  Add to Library
                </>
              )}
            </button>

            {type === "tv" && (
              <div className="season-episode-badge">
                Season {currentSeason} • Episode {currentEpisode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Breadcrumb */}
      <div className="breadcrumb">
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Home
        </span>
        <span className="breadcrumb-separator">/</span>
        <span
          style={{ cursor: "pointer" }}
          onClick={() => navigate(type === "movie" ? "/movies" : "/tv-shows")}
        >
          {type === "movie" ? "Movies" : "TV Shows"}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{title}</span>
      </div>

      <div className="watch-container">
        {/* Main Cinema Area */}
        <div className="main-content">
          <div className="video-player-section">
            <div className="video-container">
              <iframe
                src={getVideoUrl()}
                className="video-player"
                allowFullScreen
                title="Video Player"
                key={`${currentServer}-${currentSeason}-${currentEpisode}`}
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>

            {/* Details and Server Controls */}
            <div className="controls-section">
              <div className="details-section">
                <h3 className="section-title">
                  {type === "movie" ? (
                    <FilmIcon size={20} />
                  ) : (
                    <TvIcon size={20} />
                  )}
                  {title}
                </h3>
                <p className="content-overview">
                  {contentInfo?.overview ||
                    "No overview description available for this title."}
                </p>
              </div>

              <div className="server-dropdown-section">
                <h3 className="section-title">Select Server</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                  }}
                >
                  {servers.map((server, index) => {
                    const isCurrent = currentServer === index;
                    return (
                      <button
                        key={server.name}
                        type="button"
                        onClick={() => setCurrentServer(index)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-md)",
                          background: isCurrent
                            ? "var(--brand-primary)"
                            : "var(--bg-surface-elevated)",
                          color: "#ffffff",
                          border: isCurrent
                            ? "1px solid var(--brand-hover)"
                            : "1px solid var(--border-default)",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.84rem",
                          transition: "all var(--transition-fast)",
                          boxShadow: isCurrent
                            ? "0 2px 10px var(--brand-glow)"
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: isCurrent
                              ? "#22c55e"
                              : "var(--text-muted)",
                          }}
                        />
                        {server.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* TV Show Episodes Section */}
          {type === "tv" && (
            <div className="episode-section">
              <div className="season-selector">
                <label htmlFor="seasonSelect">Select Season</label>
                <select
                  id="seasonSelect"
                  value={currentSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="season-dropdown"
                >
                  {seasons.map((season) => (
                    <option
                      key={season.season_number}
                      value={season.season_number}
                    >
                      {season.name} ({season.episode_count} episodes)
                    </option>
                  ))}
                </select>
              </div>

              <div className="episodes-grid">
                <h4 className="episodes-title">Episodes</h4>
                <div className="episodes-list">
                  {episodes.map((episode) => {
                    const isCurrentEp =
                      currentEpisode === episode.episode_number;
                    return (
                      <button
                        key={episode.episode_number}
                        type="button"
                        className={`episode-card ${isCurrentEp ? "active" : ""}`}
                        onClick={() =>
                          setCurrentEpisode(episode.episode_number)
                        }
                      >
                        <div className="episode-number">
                          E{episode.episode_number}
                        </div>
                        <div className="episode-content">
                          <div className="episode-title">{episode.name}</div>
                          <div className="episode-meta">
                            {episode.runtime && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <ClockIcon size={12} />
                                {episode.runtime}m
                              </span>
                            )}
                            {episode.air_date && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <CalendarIcon size={12} />
                                {new Date(episode.air_date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Recommendations Sidebar */}
        <aside className="recommendations-sidebar">
          <h3 className="section-title">Recommended</h3>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="recommendation-item"
                  onClick={() =>
                    handleRecommendationClick(rec.media_type || type, rec.id)
                  }
                  role="button"
                  tabIndex={0}
                >
                  {rec.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${rec.poster_path}`}
                      alt={rec.title || rec.name}
                      style={{
                        width: "40px",
                        height: "58px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "40px",
                        height: "58px",
                        background: "var(--bg-surface-elevated)",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="recommendation-title">
                      {rec.title || rec.name}
                    </div>
                    {rec.vote_average > 0 && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.76rem",
                          color: "var(--accent-gold)",
                          marginTop: "2px",
                        }}
                      >
                        <StarIcon size={12} fill="currentColor" />
                        {rec.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-recommendations">
                <p>No similar titles found</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Watch;
