import { useState, useEffect, useCallback, useMemo } from "react";
import { cachedFetch, CACHE_TTL, clearApiCache } from "../services/apiCache";
import { rateLimiter } from "../services/rateLimiter";

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

  /**
   * Safe fetch combining client-side rate limiting, in-flight request deduplication,
   * and multi-tier in-memory/sessionStorage caching.
   */
  const safeFetch = useCallback(async (url, ttl = CACHE_TTL.MEDIUM) => {
    return rateLimiter.execute(() =>
      cachedFetch(
        url,
        async () => {
          const res = await fetch(url);
          if (!res.ok) {
            const errorText = await res.text().catch(() => "");
            const err = new Error(
              `HTTP error! status: ${res.status}, response: ${errorText}`,
            );
            err.status = res.status;
            throw err;
          }
          return await res.json();
        },
        ttl,
      ),
    );
  }, []);

  const checkApiStatus = useCallback(async () => {
    try {
      const testUrl = buildUrl("/configuration");
      await safeFetch(testUrl, CACHE_TTL.STATIC);
      setApiStatus("working");
    } catch (error) {
      console.error("API connection error:", error);
      setApiStatus("error");
    }
  }, [buildUrl, safeFetch]);

  const fetchGenres = useCallback(async () => {
    try {
      const [movieData, tvData] = await Promise.all([
        safeFetch(buildUrl("/genre/movie/list"), CACHE_TTL.STATIC),
        safeFetch(buildUrl("/genre/tv/list"), CACHE_TTL.STATIC),
      ]);

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
  }, [buildUrl, safeFetch]);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const url = buildUrl("/movie/now_playing", {
        language: "en-US",
        page: 1,
      });
      const data = await safeFetch(url, CACHE_TTL.MEDIUM);
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch now playing movies:", error);
      throw error;
    }
  }, [buildUrl, safeFetch]);

  const fetchTrending = useCallback(
    async (type, timeWindow = "week") => {
      try {
        const url = buildUrl(`/trending/${type}/${timeWindow}`);
        const data = await safeFetch(url, CACHE_TTL.MEDIUM);
        return data.results || [];
      } catch (error) {
        console.error(`Failed to fetch trending ${type}:`, error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
  );

  const fetchTrendingAnime = useCallback(async () => {
    try {
      const url = buildUrl("/discover/tv", {
        with_genres: 16,
        with_keywords: 210024,
        sort_by: "popularity.desc",
      });
      const data = await safeFetch(url, CACHE_TTL.MEDIUM);
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      throw error;
    }
  }, [buildUrl, safeFetch]);

  const searchTMDB = useCallback(
    async (query) => {
      if (!query.trim()) return [];

      try {
        const url = buildUrl("/search/multi", {
          query: query.trim(),
          include_adult: false,
          language: "en-US",
        });

        const data = await safeFetch(url, CACHE_TTL.SHORT);

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
    [buildUrl, safeFetch],
  );

  const fetchCredits = useCallback(
    async (type, id) => {
      try {
        const url = buildUrl(`/${type}/${id}/credits`);
        const data = await safeFetch(url, CACHE_TTL.LONG);
        return data.cast?.slice(0, 4).map((actor) => actor.name) || [];
      } catch (error) {
        console.error("Failed to fetch credits:", error);
        return [];
      }
    },
    [buildUrl, safeFetch],
  );

  const fetchSeasonEpisodes = useCallback(
    async (tvId, seasonNumber) => {
      try {
        const url = buildUrl(`/tv/${tvId}/season/${seasonNumber}`);
        const data = await safeFetch(url, CACHE_TTL.LONG);
        return data.episodes || [];
      } catch (error) {
        console.error("Failed to fetch episodes:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
  );

  const fetchTVDetails = useCallback(
    async (tvId) => {
      try {
        const url = buildUrl(`/tv/${tvId}`);
        return await safeFetch(url, CACHE_TTL.LONG);
      } catch (error) {
        console.error("Failed to fetch TV details:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
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
        const data = await safeFetch(url, CACHE_TTL.MEDIUM);
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch discover movies:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
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
        const data = await safeFetch(url, CACHE_TTL.MEDIUM);
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch discover TV:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
  );

  const fetchMovieRecommendations = useCallback(
    async (movieId) => {
      try {
        const url = buildUrl(`/movie/${movieId}/recommendations`);
        const data = await safeFetch(url, CACHE_TTL.LONG);
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch movie recommendations:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
  );

  const fetchTVRecommendations = useCallback(
    async (tvId) => {
      try {
        const url = buildUrl(`/tv/${tvId}/recommendations`);
        const data = await safeFetch(url, CACHE_TTL.LONG);
        return data.results || [];
      } catch (error) {
        console.error("Failed to fetch TV recommendations:", error);
        throw error;
      }
    },
    [buildUrl, safeFetch],
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
    clearApiCache,
    ...constants,
  };
};
