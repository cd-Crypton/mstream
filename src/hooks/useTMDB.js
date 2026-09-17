import { useState, useEffect, useCallback, useMemo } from "react";

const POSTER_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export const useTMDB = () => {
  const [movieGenres, setMovieGenres] = useState(new Map());
  const [tvGenres, setTvGenres] = useState(new Map());
  const [apiStatus, setApiStatus] = useState("checking");

  const getApiBaseUrl = useCallback(() => {
    return "/api";
  }, []);

  const buildUrl = useCallback(
    (endpoint, params = {}) => {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}${endpoint}`, window.location.origin);

      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      return url.toString();
    },
    [getApiBaseUrl],
  );

  const checkApiStatus = useCallback(async () => {
    try {
      const testUrl = buildUrl("/configuration");
      const testResponse = await fetch(testUrl);

      if (testResponse.ok) {
        setApiStatus("working");
      } else {
        setApiStatus("error");
        console.error("API test failed:", await testResponse.text());
      }
    } catch (error) {
      console.error("API connection error:", error);
      setApiStatus("error");
    }
  }, [buildUrl]);

  const fetchGenres = useCallback(async () => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(buildUrl("/genre/movie/list")),
        fetch(buildUrl("/genre/tv/list")),
      ]);

      if (!movieRes.ok) {
        throw new Error(`Movie genres failed: ${movieRes.status}`);
      }
      if (!tvRes.ok) {
        throw new Error(`TV genres failed: ${tvRes.status}`);
      }

      const movieData = await movieRes.json();
      const tvData = await tvRes.json();

      const movieMap = new Map(
        movieData.genres?.map((genre) => [genre.id, genre.name]) || [],
      );
      const tvMap = new Map(
        tvData.genres?.map((genre) => [genre.id, genre.name]) || [],
      );

      setMovieGenres(movieMap);
      setTvGenres(tvMap);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    }
  }, [buildUrl]);

  // Memoize all fetch functions
  const fetchNowPlaying = useCallback(async () => {
    try {
      const url = buildUrl("/movie/now_playing", {
        language: "en-US",
        page: 1,
      });

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `HTTP error! status: ${res.status}, response: ${errorText}`,
        );
      }

      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch now playing movies:", error);
      throw error;
    }
  }, [buildUrl]);

  const fetchTrending = useCallback(
    async (type, timeWindow = "week") => {
      try {
        const url = buildUrl(`/trending/${type}/${timeWindow}`);

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, response: ${errorText}`,
          );
        }

        const data = await res.json();
        return data.results || [];
      } catch (error) {
        console.error(`Failed to fetch trending ${type}:`, error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchTrendingAnime = useCallback(async () => {
    try {
      const url = buildUrl("/discover/tv", {
        with_genres: 16,
        with_keywords: 210024,
        sort_by: "popularity.desc",
      });

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `HTTP error! status: ${res.status}, response: ${errorText}`,
        );
      }

      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      throw error;
    }
  }, [buildUrl]);

  // Add useCallback to all other fetch functions similarly
  const searchTMDB = useCallback(
    async (query) => {
      if (!query.trim()) return [];

      try {
        const url = buildUrl("/search/multi", {
          query: query.trim(),
          include_adult: false,
          language: "en-US",
        });

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, response: ${errorText}`,
          );
        }

        const data = await res.json();

        return (
          data.results?.filter((item) => {
            if (item.media_type === "person") return false;
            return item.media_type === "movie" || item.media_type === "tv";
          }) || []
        );
      } catch (error) {
        console.error("Search failed:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchCredits = useCallback(
    async (type, id) => {
      try {
        const url = buildUrl(`/${type}/${id}/credits`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.cast?.slice(0, 4).map((actor) => actor.name) || [];
      } catch (error) {
        console.error("Failed to fetch credits:", error);
        return [];
      }
    },
    [buildUrl],
  );

  const fetchSeasonEpisodes = useCallback(
    async (tvId, seasonNumber) => {
      try {
        const url = buildUrl(`/tv/${tvId}/season/${seasonNumber}`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.episodes || [];
      } catch (error) {
        console.error("Failed to fetch episodes:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchTVDetails = useCallback(
    async (tvId) => {
      try {
        const url = buildUrl(`/tv/${tvId}`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
      } catch (error) {
        console.error("Failed to fetch TV details:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchDiscoverMovies = useCallback(
    async (params = {}) => {
      try {
        const url = buildUrl("/discover/movie", {
          sort_by: "popularity.desc",
          include_adult: false,
          include_video: false,
          language: "en-US",
          page: 1,
          ...params,
        });

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, response: ${errorText}`,
          );
        }

        const data = await res.json();
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch discover movies:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchDiscoverTV = useCallback(
    async (params = {}) => {
      try {
        const url = buildUrl("/discover/tv", {
          sort_by: "popularity.desc",
          include_adult: false,
          include_null_first_air_dates: false,
          language: "en-US",
          page: 1,
          ...params,
        });

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, response: ${errorText}`,
          );
        }

        const data = await res.json();
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch discover TV:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchMovieRecommendations = useCallback(
    async (movieId) => {
      try {
        const url = buildUrl(`/movie/${movieId}/recommendations`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch movie recommendations:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  const fetchTVRecommendations = useCallback(
    async (tvId) => {
      try {
        const url = buildUrl(`/tv/${tvId}/recommendations`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch TV recommendations:", error);
        throw error;
      }
    },
    [buildUrl],
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await checkApiStatus();
        await fetchGenres();
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [checkApiStatus, fetchGenres]);

  // Memoize constants to prevent recreation
  const constants = useMemo(
    () => ({
      POSTER_URL,
      BACKDROP_URL,
    }),
    [],
  );

  return {
    movieGenres,
    tvGenres,
    apiStatus,
    fetchNowPlaying,
    fetchTrending,
    fetchTrendingAnime,
    searchTMDB,
    fetchCredits,
    fetchSeasonEpisodes,
    fetchTVDetails,
    fetchDiscoverMovies,
    fetchDiscoverTV,
    fetchMovieRecommendations,
    fetchTVRecommendations,
    ...constants,
  };
};
