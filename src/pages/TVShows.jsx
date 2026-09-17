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

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = 300;

  const [filters, setFilters] = useState({
    sort_by: searchParams.get("sort_by") || "popularity.desc",
    include_adult: searchParams.get("include_adult") === "true" || false,
    include_null_first_air_dates:
      searchParams.get("include_null_first_air_dates") === "true" || false,
    language: searchParams.get("language") || "en-US",
    page: parseInt(searchParams.get("page")) || 1,
    first_air_date_year: searchParams.get("first_air_date_year")
      ? parseInt(searchParams.get("first_air_date_year"))
      : undefined,
    with_genres: searchParams.get("with_genres") || undefined,
    with_status: searchParams.get("with_status") || undefined,
  });

  const { tvGenres, fetchDiscoverTV, fetchCredits } = useTMDB();

  useEffect(() => {
    fetchTVShows();
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

  const fetchTVShows = async () => {
    try {
      setLoading(true);
      const results = await fetchDiscoverTV(filters);
      setTvShows(results);
    } catch (error) {
      console.error("Failed to fetch TV shows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    const type = "tv";
    const genreMap = tvGenres;
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
      sort_by: "popularity.desc",
      include_adult: false,
      include_null_first_air_dates: false,
      language: "en-US",
      page: 1,
    });
  };

  return (
    <div className="tv-shows-page">
      <div className="page-header">
        <h1>TV Series</h1>
        <p>
          Binge-worthy shows, anime, and trending international drama series
        </p>
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
            <label htmlFor="tvSortBySelect">Sort By</label>
            <select
              id="tvSortBySelect"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
            >
              <option value="popularity.desc">Popularity (High to Low)</option>
              <option value="popularity.asc">Popularity (Low to High)</option>
              <option value="vote_average.desc">Rating (Highest First)</option>
              <option value="vote_average.asc">Rating (Lowest First)</option>
              <option value="first_air_date.desc">
                First Air Date (Newest)
              </option>
              <option value="first_air_date.asc">
                First Air Date (Oldest)
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tvYearSelect">First Air Year</label>
            <select
              id="tvYearSelect"
              value={filters.first_air_date_year || ""}
              onChange={(e) =>
                handleFilterChange({
                  first_air_date_year: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
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
            <label htmlFor="tvGenreSelect">Genre</label>
            <select
              id="tvGenreSelect"
              value={filters.with_genres || ""}
              onChange={(e) =>
                handleFilterChange({
                  with_genres: e.target.value || undefined,
                })
              }
            >
              <option value="">All Genres</option>
              {Array.from(tvGenres.entries()).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tvStatusSelect">Show Status</label>
            <select
              id="tvStatusSelect"
              value={filters.with_status || ""}
              onChange={(e) =>
                handleFilterChange({
                  with_status: e.target.value || undefined,
                })
              }
            >
              <option value="">All Statuses</option>
              <option value="0">Returning Series</option>
              <option value="1">Planned</option>
              <option value="2">In Production</option>
              <option value="3">Ended</option>
              <option value="4">Cancelled</option>
              <option value="5">Pilot</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: "350px" }}>
          <div className="loading-spinner"></div>
          <p>Loading TV series...</p>
        </div>
      ) : (
        <>
          <div className="content-rows">
            <MovieRow
              title={`TV Series (Page ${filters.page})`}
              items={tvShows}
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

export default TVShows;
