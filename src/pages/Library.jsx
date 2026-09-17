import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import MovieCard from "../components/MovieCard";
import Modal from "../components/Modal";
import {
  BookmarkIcon,
  SearchIcon,
  CloseIcon,
  TrashIcon,
  FilmIcon,
  TvIcon,
} from "../components/Icons";
import "./Library.css";

const Library = () => {
  const { library, clearLibrary, removeFromLibrary } = useLibrary();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter library by media type
  const filteredByType = useMemo(() => {
    if (activeTab === "movie") {
      return library.filter(
        (item) =>
          item.media_type === "movie" ||
          item.type === "movie" ||
          (!item.first_air_date && item.release_date),
      );
    }
    if (activeTab === "tv") {
      return library.filter(
        (item) =>
          item.media_type === "tv" ||
          item.type === "tv" ||
          Boolean(item.first_air_date),
      );
    }
    return library;
  }, [library, activeTab]);

  // Filter by search query
  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    const query = searchQuery.toLowerCase().trim();
    return filteredByType.filter((item) => {
      const title = (item.title || item.name || "").toLowerCase();
      const overview = (item.overview || "").toLowerCase();
      return title.includes(query) || overview.includes(query);
    });
  }, [filteredByType, searchQuery]);

  const moviesCount = useMemo(
    () =>
      library.filter(
        (item) =>
          item.media_type === "movie" ||
          item.type === "movie" ||
          (!item.first_air_date && item.release_date),
      ).length,
    [library],
  );

  const tvCount = useMemo(
    () =>
      library.filter(
        (item) =>
          item.media_type === "tv" ||
          item.type === "tv" ||
          Boolean(item.first_air_date),
      ).length,
    [library],
  );

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all saved titles from your library?",
      )
    ) {
      clearLibrary();
    }
  };

  return (
    <div className="library-page">
      <div className="page-header catalog-header">
        <h1>My Library</h1>
        <p>
          Your personal collection of saved movies, TV shows, and anime. Safely
          preserved in your browser without requiring an account.
        </p>

        {/* Centered Tab Filter Pill */}
        <div className="library-tabs-container">
          <div
            className="library-tabs"
            role="tablist"
            aria-label="Filter library titles"
          >
            <button
              type="button"
              className={`library-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
              role="tab"
              aria-selected={activeTab === "all"}
            >
              All ({library.length})
            </button>
            <button
              type="button"
              className={`library-tab ${activeTab === "movie" ? "active" : ""}`}
              onClick={() => setActiveTab("movie")}
              role="tab"
              aria-selected={activeTab === "movie"}
            >
              <FilmIcon size={16} />
              Movies ({moviesCount})
            </button>
            <button
              type="button"
              className={`library-tab ${activeTab === "tv" ? "active" : ""}`}
              onClick={() => setActiveTab("tv")}
              role="tab"
              aria-selected={activeTab === "tv"}
            >
              <TvIcon size={16} />
              TV Shows ({tvCount})
            </button>
          </div>
        </div>

        {/* Centered Action Controls (Search & Clear) */}
        {library.length > 0 && (
          <div className="library-actions-bar">
            <div className="library-search-box">
              <SearchIcon size={16} className="library-search-icon" />
              <input
                type="text"
                placeholder="Filter saved titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="library-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="library-search-clear"
                  aria-label="Clear filter"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="library-clear-btn"
              onClick={handleClearAll}
              title="Clear entire library"
            >
              <TrashIcon size={16} />
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="library-content">
        {library.length === 0 ? (
          <div className="library-empty-state">
            <div className="empty-icon-wrap">
              <BookmarkIcon size={44} />
            </div>
            <h2>Your Library is Empty</h2>
            <p>
              Tap the bookmark icon on any movie, series, or hero banner to add
              titles to your watchlist for instant access anytime.
            </p>
            <Link to="/" className="btn btn-primary explore-btn">
              Explore Trending Titles
            </Link>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="library-empty-search">
            <p>No saved titles match "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn btn-secondary"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid-container">
            {displayedItems.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type || "item"}`}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && <Modal item={selectedItem} onClose={handleCloseModal} />}
    </div>
  );
};

export default Library;
