import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';

const Watch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  const [currentServer, setCurrentServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { fetchMovieRecommendations, fetchTVRecommendations, POSTER_URL } = useTMDB();

  const servers = [
    { 
      name: 'Cinezo', 
      getUrl: (s, e) => `https://api.cinezo.net/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    },
    { 
      name: 'ZXCStream', 
      getUrl: (s, e) => `https://z.zxcstream.xyz/player/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    },
    { 
      name: 'VAPlayer', 
      getUrl: (s, e) => `https://vaplayer.ru/embed/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    },
    { 
      name: 'VIDPlay', 
      getUrl: (s, e) => `https://vidplays.fun/embed/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    },
    { 
      name: 'VIDZen', 
      getUrl: (s, e) => `https://vidzen.fun/embed/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    },
    { 
      name: 'CINESrc', 
      getUrl: (s, e) => `https://cinesrc.net/embed/${type}/${id}/${type === 'tv' ? `/${s}/${e}` : ''}` 
    }
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
      
      // Fetch basic content info
      const contentRes = await fetch(`/api/${type}/${id}`);
      const contentData = await contentRes.json();
      setContentInfo(contentData);

      // Fetch recommendations
      await fetchRecommendations();

      if (type === 'tv') {
        await fetchSeasons();
      }
    } catch (error) {
      console.error('Failed to fetch content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      let recommendationsData = [];
      if (type === 'movie') {
        recommendationsData = await fetchMovieRecommendations(id);
      } else if (type === 'tv') {
        recommendationsData = await fetchTVRecommendations(id);
      }
      setRecommendations(recommendationsData.slice(0, 10)); // Limit to 10 recommendations
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
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
      console.error('Failed to fetch seasons:', error);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    try {
      const res = await fetch(`/api/tv/${id}/season/${seasonNumber}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setCurrentEpisode(1);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
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
    window.location.reload(); // Refresh to load new content
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="loading-spinner"></div>
        <p>Loading player...</p>
      </div>
    );
  }

  if (!type || !id) {
    return (
      <div className="watch-error">
        <div className="error-content">
          <h1>Content Not Found</h1>
          <p>The requested content could not be loaded.</p>
          <button 
            className="back-home-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page">
      {/* Header */}
      <div className="watch-header">
        <div className="watch-header-content">
          <button
            className="back-browse-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Browse
          </button>

          {type === 'tv' && (
            <div className="season-episode-badge">
              S{currentSeason} • E{currentEpisode}
            </div>
          )}
        </div>
      </div>

      <div className="breadcrumb">
        Home &gt;&gt; {type === 'movie' ? 'Movies' : 'TV Shows'} &gt;&gt; {contentInfo?.title || contentInfo?.name}
      </div>
      
      <div className="watch-container">
        {/* Main Content Area */}
        <div className="main-content">
          {/* Video Player Section */}
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

            {/* Details and Server Section */}
            <div className="controls-section">
              <div className="details-section">
                <h3 className="section-title">Details</h3>
                <div className="content-overview">
                  {contentInfo?.overview || 'No overview available.'}
                </div>
              </div>

              <div className="server-dropdown-section">
                <h3 className="section-title">Select Server</h3>
                <select 
                  value={currentServer}
                  onChange={(e) => setCurrentServer(Number(e.target.value))}
                  className="server-dropdown"
                >
                  {servers.map((server, index) => (
                    <option className="serverList" key={index} value={index}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="recommendations-sidebar">
            <h3 className="section-title">Recommendations</h3>
            <div className="recommendations-list">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="recommendation-item"
                    onClick={() => handleRecommendationClick(rec.media_type || type, rec.id)}
                  >
                    <div className="recommendation-title">
                      {rec.title || rec.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TV Show Episodes Section */}
        {type === 'tv' && (
          <div className="episode-section">
            <div className="season-selector">
              <label className="selector-label">Season</label>
              <select 
                value={currentSeason} 
                onChange={(e) => handleSeasonChange(Number(e.target.value))}
                className="season-dropdown"
              >
                {seasons.map(season => (
                  <option key={season.season_number} value={season.season_number}>
                    {season.name} ({season.episode_count} episodes)
                  </option>
                ))}
              </select>
            </div>

            <div className="episodes-grid">
              <h4 className="episodes-title">Episodes</h4>
              <div className="episodes-list">
                {episodes.map(episode => (
                  <button
                    key={episode.episode_number}
                    className={`episode-card ${currentEpisode === episode.episode_number ? 'active' : ''}`}
                    onClick={() => setCurrentEpisode(episode.episode_number)}
                  >
                    <div className="episode-number">
                      E{episode.episode_number}
                    </div>
                    <div className="episode-content">
                      <div className="episode-title">{episode.name}</div>
                      <div className="episode-meta">
                        {episode.runtime && (
                          <span className="episode-runtime">{episode.runtime}m</span>
                        )}
                        {episode.air_date && (
                          <span className="episode-date">
                            {new Date(episode.air_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
