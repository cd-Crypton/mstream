import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieRow from '../components/MovieRow';
import Modal from '../components/Modal';
import { useTMDB } from '../hooks/useTMDB';

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // TMDB API caps discover results at 500 pages max
  const totalPages = 300;

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    sort_by: searchParams.get('sort_by') || 'popularity.desc',
    include_adult: searchParams.get('include_adult') === 'true' || false,
    include_null_first_air_dates: searchParams.get('include_null_first_air_dates') === 'true' || false,
    language: searchParams.get('language') || 'en-US',
    page: parseInt(searchParams.get('page')) || 1,
    first_air_date_year: searchParams.get('first_air_date_year') ? parseInt(searchParams.get('first_air_date_year')) : undefined,
    with_genres: searchParams.get('with_genres') || undefined,
    with_status: searchParams.get('with_status') || undefined
  });

  const {
    tvGenres,
    fetchDiscoverTV,
    fetchCredits
  } = useTMDB();

  useEffect(() => {
    fetchTVShows();
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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
    const type = 'tv';
    const genreMap = tvGenres;
    const genreNames = item.genre_ids?.map(id => genreMap.get(id)).filter(Boolean) || [];

    const cast = await fetchCredits(type, item.id);

    setSelectedItem({
      ...item,
      type,
      genres: genreNames,
      cast: cast.join(', ') || 'N/A'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Dedicated pagination handler that keeps current filtering variables intact
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      sort_by: 'popularity.desc',
      include_adult: false,
      include_null_first_air_dates: false,
      language: 'en-US',
      page: 1
    });
  };

  return (
    <div className="tv-shows-page">
      <div className="page-header">
        <h1>TV Shows</h1>
        <p>Discover the latest and greatest TV series</p>
        <button 
          className="clear-filters-btn"
          onClick={clearFilters}
          style={{
            background: 'var(--netflix-red)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="sort-by">Sort By:</label>
            <select
              id="sort-by"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
            >
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="popularity.desc">Popularity Descending</option>
              <option value="first_air_date.asc">First Air Date Ascending</option>
              <option value="first_air_date.desc">First Air Date Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_count.asc">Vote Count Ascending</option>
              <option value="vote_count.desc">Vote Count Descending</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="first-air-year">First Air Year:</label>
            <select
              id="first-air-year"
              value={filters.first_air_date_year || ''}
              onChange={(e) => handleFilterChange({
                first_air_date_year: e.target.value ? parseInt(e.target.value) : undefined
              })}
            >
              <option value="">All Years</option>
              {Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="genre">Genre:</label>
            <select
              id="genre"
              value={filters.with_genres || ''}
              onChange={(e) => handleFilterChange({
                with_genres: e.target.value || undefined
              })}
            >
              <option value="">All Genres</option>
              {Array.from(tvGenres.entries()).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={filters.with_status || ''}
              onChange={(e) => handleFilterChange({
                with_status: e.target.value || undefined
              })}
            >
              <option value="">All Status</option>
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

      {/* Inline Loading Logic preserves layout shell during API requests */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: '300px' }}>
          <div className="loading-spinner"></div>
          <p>Loading TV shows...</p>
        </div>
      ) : (
        <>
          <div className="content-rows">
            <MovieRow
              title={`TV Shows (Page ${filters.page})`}
              items={tvShows}
              onItemClick={handleItemClick}
            />
          </div>

          {/* Pagination Component */}
          <div className="pagination" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            margin: '40px 0',
            color: 'white'
          }}>
            <button
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
              style={{
                padding: '8px 16px',
                background: filters.page === 1 ? '#333' : 'var(--netflix-red, #e50914)',
                color: filters.page === 1 ? '#aaa' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: filters.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <span>Page <strong>{filters.page}</strong> of {totalPages}</span>
            
            <button
              disabled={filters.page === totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              style={{
                padding: '8px 16px',
                background: filters.page === totalPages ? '#333' : 'var(--netflix-red, #e50914)',
                color: filters.page === totalPages ? '#aaa' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: filters.page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
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
