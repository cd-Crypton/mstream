import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import Modal from "../components/Modal";
import { useTMDB } from "../hooks/useTMDB";
import {
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../components/Icons";

const Popular = () => {
  const [movies, setMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = 300;

  const [filters, setFilters] = useState({
    include_adult: searchParams.get("include_adult") === "true" || false,
    include_video: searchParams.get("include_video") === "true" || false,
    language: searchParams.get("language") || "en-US",
    page: parseInt(searchParams.get("page")) || 1,
    year: searchParams.get("year")
      ? parseInt(searchParams.get("year"))
      : undefined,
    with_genres: searchParams.get("with_genres") || undefined,
    "vote_average.gte": searchParams.get("vote_average.gte")
      ? parseFloat(searchParams.get("vote_average.gte"))
      : undefined,
  });

  const { movieGenres, fetchCredits } = useTMDB();

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const buildUrl = (endpoint, params = {}) => {
    const url = new URL(`/api${endpoint}`, window.location.origin);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const url = buildUrl("/movie/popular", filters);

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `HTTP error! status: ${res.status}, response: ${errorText}`,
        );
      }

      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Failed to fetch popular movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    const type = "movie";
    const genreMap = movieGenres;
    const genreNames =
      item.genre_ids?.map((id) => genreMap.get(id)).filter(Boolean) || [];

    const cast = await fetchCredits(type, item.id);

    setSelectedItem({
      ...item,
      type,
      genres: genreNames,
      cast: cast.join(", ") || "N/A",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      include_adult: false,
      include_video: false,
      language: "en-US",
      page: 1,
    });
  };

  return (
    <div className="movies-page">
      <div className="page-header">
        <h1>Popular Movies</h1>
        <p>Discover what audiences worldwide are streaming right now</p>
        <div className="clear-filters-container">
          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            <CloseIcon size={14} />
            Clear All Filters
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="popYearSelect">Release Year</label>
            <select
              id="popYearSelect"
              value={filters.year || ""}
              onChange={(e) =>
                handleFilterChange({
                  year: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            >
              <option value="">All Years</option>
              {Array.from(
                { length: new Date().getFullYear() - 1930 + 1 },
                (_, i) => new Date().getFullYear() - i,
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="popGenreSelect">Genre</label>
            <select
              id="popGenreSelect"
              value={filters.with_genres || ""}
              onChange={(e) =>
                handleFilterChange({
                  with_genres: e.target.value || undefined,
                })
              }
            >
              <option value="">All Genres</option>
              {Array.from(movieGenres.entries()).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="popRatingSelect">Minimum Rating</label>
            <select
              id="popRatingSelect"
              value={filters["vote_average.gte"] || ""}
              onChange={(e) =>
                handleFilterChange({
                  "vote_average.gte": e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            >
              <option value="">Any Rating</option>
              <option value="8">8.0+ Exceptional</option>
              <option value="7">7.0+ Great</option>
              <option value="6">6.0+ Good</option>
              <option value="5">5.0+ Average</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: "350px" }}>
          <div className="loading-spinner"></div>
          <p>Loading popular titles...</p>
        </div>
      ) : (
        <>
          <div className="content-rows">
            <MovieRow
              title={`Popular Movies (Page ${filters.page})`}
              items={movies}
              onItemClick={handleItemClick}
            />
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={16} />
              Previous
            </button>

            <span>
              Page <strong>{filters.page}</strong> of {totalPages}
            </span>

            <button
              type="button"
              disabled={filters.page === totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </>
      )}

      {isModalOpen && selectedItem && (
        <Modal item={selectedItem} onClose={closeModal} />
      )}
    </div>
  );
};

export default Popular;
