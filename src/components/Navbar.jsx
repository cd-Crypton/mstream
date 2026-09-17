import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import {
  SearchIcon,
  CloseIcon,
  FilmIcon,
  TvIcon,
  FlameIcon,
  StarIcon,
  BookmarkIcon,
} from "./Icons";

const Navbar = ({ onSearch, searchResults, onItemClick, isSearching }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const { libraryCount } = useLibrary();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w92${posterPath}`;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      if (onSearch) onSearch("");
      return;
    }

    // Rate-limiting debounce for search typing
    searchTimeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 280);
  };

  const handleClearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 250);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleItemSelect = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const isCurrent = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="MSTREAM Home">
          <img
            src="/logo/mstream-new.png"
            alt="MSTREAM"
            className="logo-image"
          />
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isCurrent("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link
            to="/tv-shows"
            className={`nav-link ${isCurrent("/tv-shows") ? "active" : ""}`}
          >
            TV Shows
          </Link>
          <Link
            to="/movies"
            className={`nav-link ${isCurrent("/movies") ? "active" : ""}`}
          >
            Movies
          </Link>
          <Link
            to="/popular"
            className={`nav-link ${isCurrent("/popular") ? "active" : ""}`}
          >
            Popular
          </Link>
          <Link
            to="/library"
            className={`nav-link ${isCurrent("/library") ? "active" : ""}`}
          >
            <BookmarkIcon size={16} />
            Library
            {libraryCount > 0 && (
              <span className="nav-badge">{libraryCount}</span>
            )}
          </Link>
        </div>

        <div className="navbar-search-container">
          <div
            className={`search-bar-wrapper ${isSearchFocused ? "focused" : ""}`}
          >
            <span className="search-icon-adornment">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleSearchBlur}
              className="navbar-search-input"
              autoComplete="off"
              aria-label="Search movies and TV shows"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search query"
              >
                <CloseIcon size={16} />
              </button>
            )}

            {/* Inline Search Results Dropdown */}
            {isSearchFocused && searchQuery && (
              <div className="search-results-dropdown">
                <div className="search-results-list">
                  {searchResults && searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={`${item.id}-${item.media_type || "item"}`}
                        className="search-result-item"
                        onMouseDown={() => handleItemSelect(item)}
                      >
                        <div className="search-result-poster">
                          {getPosterUrl(item.poster_path) ? (
                            <img
                              src={getPosterUrl(item.poster_path)}
                              alt={item.title || item.name}
                              loading="lazy"
                            />
                          ) : (
                            <div className="poster-placeholder">
                              <span>No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="search-result-info">
                          <div className="search-result-title">
                            {item.title || item.name}
                          </div>
                          <div className="search-result-meta">
                            <span className="search-result-type">
                              {item.media_type ||
                                (item.first_air_date ? "tv" : "movie")}
                            </span>
                            {item.vote_average > 0 && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  color: "var(--accent-gold)",
                                }}
                              >
                                <StarIcon size={12} fill="currentColor" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                            {(item.release_date || item.first_air_date) && (
                              <span className="search-result-year">
                                (
                                {new Date(
                                  item.release_date || item.first_air_date,
                                ).getFullYear()}
                                )
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : isSearching ? (
                    <div className="search-loading">
                      <p>Searching titles...</p>
                    </div>
                  ) : (
                    <div className="search-no-results">
                      <p>No titles found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="side-menu-header">
            <h3>Menu</h3>
            <button
              className="close-menu"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <CloseIcon size={18} />
            </button>
          </div>
          <div className="side-menu-links">
            <Link
              to="/"
              className={`nav-link ${isCurrent("/") ? "active" : ""}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/tv-shows"
              className={`nav-link ${isCurrent("/tv-shows") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <TvIcon size={18} />
              TV Shows
            </Link>
            <Link
              to="/movies"
              className={`nav-link ${isCurrent("/movies") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <FilmIcon size={18} />
              Movies
            </Link>
            <Link
              to="/popular"
              className={`nav-link ${isCurrent("/popular") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <FlameIcon size={18} fill="currentColor" />
              Popular
            </Link>
            <Link
              to="/library"
              className={`nav-link ${isCurrent("/library") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <BookmarkIcon size={18} />
              Library
              {libraryCount > 0 && (
                <span className="nav-badge">{libraryCount}</span>
              )}
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="menu-overlay active" onClick={closeMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
