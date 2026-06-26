import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieRow from '../components/MovieRow';
import Modal from '../components/Modal';
import { useTMDB } from '../hooks/useTMDB';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Hardcoded or dynamically fetched from TMDB metadata (TMDB defaults to 500 max discover pages)
  const totalPages = 300; 

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    sort_by: searchParams.get('sort_by') || 'popularity.desc',
    include_adult: searchParams.get('include_adult') === 'true' || false,
    include_video: searchParams.get('include_video') === 'true' || false,
    language: searchParams.get('language') || 'en-US',
    page: parseInt(searchParams.get('page')) || 1,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')) : undefined,
    with_genres: searchParams.get('with_genres') || undefined,
    'vote_average.gte': searchParams.get('vote_average.gte') ? parseFloat(searchParams.get('vote_average.gte')) : undefined
  });

  const {
    movieGenres,
    fetchDiscoverMovies,
    fetchCredits
  } = useTMDB();

  // Fetch movies whenever filters change
  useEffect(() => {
    fetchMovies();
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

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const results = await fetchDiscoverMovies(filters);
      setMovies(results);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    const type = 'movie';
    const genreMap = movieGenres;
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

  // Dedicated pagination handler so it doesn't reset the page to 1
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll back up
  };

  const clearFilters = () => {
    setFilters({
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
      language: 'en-US',
      page: 1
    });
  };

  return (
    <div className="movies-page">
      <div className="page-header">
        <h1>Movies</h1>
        <p>Discover the latest and greatest movies</p>
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
            <label>Sort By:</label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
            >
              <option value="original_title.asc">Original Title A-Z</option>
              <option value="original_title.desc">Original Title Z-A</option>
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="popularity.desc">Popularity Descending</option>
              <option value="revenue.asc">Revenue Ascending</option>
              <option value="revenue.desc">Revenue Descending</option>
              <option value="primary_release_date.asc">Release Date Ascending</option>
              <option value="title.asc">Title A-Z</option>
              <option value="title.desc">Title Z-A</option>
              <option value="primary_release_date.desc">Release Date Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_count.asc">Vote Count Ascending</option>
              <option value="vote_count.desc">Vote Count Descending</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Release Year:</label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange({
                year: e.target.value ? parseInt(e.target.value) : undefined
              })}
            >
              <option value="">All Years</option>
              {Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Genre:</label>
            <select
              value={filters.with_genres || ''}
              onChange={(e) => handleFilterChange({
                with_genres: e.target.value || undefined
              })}
            >
              <option value="">All Genres</option>
              {Array.from(movieGenres.entries()).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum Rating:</label>
            <select
              value={filters['vote_average.gte'] || ''}
              onChange={(e) => handleFilterChange({
                'vote_average.gte': e.target.value ? parseFloat(e.target.value) : undefined
              })}
            >
              <option value="">Any Rating</option>
              <option value="1">1 star</option>
              <option value="2">2 stars</option>
              <option value="3">3 stars</option>
              <option value="4">4 stars</option>
              <option value="5">5 stars</option>
              <option value="6">6 stars</option>
              <option value="7">7 stars</option>
              <option value="8">8 stars</option>
              <option value="9">9 stars</option>
              <option value="10">10 stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Embedded Loading State keeps the layout static during fetch */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: '300px' }}>
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      ) : (
        <>
          <div className="content-rows">
            <MovieRow
              title={`Movies (Page ${filters.page})`}
              items={movies}
              onItemClick={handleItemClick}
            />
          </div>

          {/* Pagination Controls */}
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

export default Movies;
