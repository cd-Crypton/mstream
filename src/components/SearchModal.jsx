import { useState, useRef, useEffect, useCallback } from "react";
import MovieCard from "./MovieCard";
import { CloseIcon, SearchIcon } from "./Icons";

const SearchModal = ({
  searchResults,
  onSearch,
  onClose,
  onItemClick,
  isSearching,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const debouncedSearch = useCallback(
    (value) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch],
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleItemSelect = (item) => {
    onItemClick(item);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-content search-modal-content">
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Close search"
        >
          <CloseIcon size={20} />
        </button>

        <div style={{ position: "relative", marginBottom: "28px" }}>
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          >
            <SearchIcon size={20} />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV series, anime..."
            value={query}
            onChange={handleInputChange}
            className="navbar-search-input"
            style={{
              height: "48px",
              paddingLeft: "48px",
              fontSize: "1.05rem",
              borderRadius: "var(--radius-md)",
            }}
            autoComplete="off"
          />
        </div>

        <div
          className="search-results"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {searchResults && searchResults.length > 0 ? (
            <div className="grid-container">
              {searchResults.map((item) => (
                <MovieCard
                  key={`${item.id}-${item.media_type || "item"}`}
                  item={item}
                  onClick={() => handleItemSelect(item)}
                />
              ))}
            </div>
          ) : query && !isSearching ? (
            <div className="search-no-results">
              <p>No titles found matching "{query}"</p>
            </div>
          ) : query && isSearching ? (
            <div className="search-loading">
              <div
                className="loading-spinner"
                style={{ margin: "0 auto 12px" }}
              ></div>
              <p>Searching titles...</p>
            </div>
          ) : (
            <div className="search-no-results">
              <p>Start typing to search across movies, TV shows, and anime</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
