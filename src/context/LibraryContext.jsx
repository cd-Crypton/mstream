import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { touchSession } from "../services/sessionManager";

const LIBRARY_STORAGE_KEY = "mstream_library";

const LibraryContext = createContext(null);

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState(() => {
    try {
      const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn("Failed to load library from localStorage:", err);
      return [];
    }
  });

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === LIBRARY_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setLibrary(updated);
        } catch (err) {
          console.warn("Error parsing synced library:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveLibrary = useCallback((newLibrary) => {
    setLibrary(newLibrary);
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(newLibrary));
      touchSession();
    } catch (err) {
      console.warn("Failed to save library to localStorage:", err);
    }
  }, []);

  const isInLibrary = useCallback(
    (id, type) => {
      if (!id) return false;
      const numId = Number(id);
      return library.some((item) => {
        const itemType =
          item.media_type ||
          item.type ||
          (item.first_air_date ? "tv" : "movie");
        const matchesId = Number(item.id) === numId;
        if (type) {
          return matchesId && itemType === type;
        }
        return matchesId;
      });
    },
    [library],
  );

  const addToLibrary = useCallback(
    (item) => {
      if (!item || !item.id) return;

      const mediaType =
        item.media_type ||
        item.type ||
        (item.first_air_date ? "tv" : "movie") ||
        "movie";

      if (isInLibrary(item.id, mediaType)) return;

      const normalizedItem = {
        id: item.id,
        media_type: mediaType,
        type: mediaType,
        title: item.title || item.name || "Untitled",
        name: item.name || item.title || "Untitled",
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        vote_average: item.vote_average || 0,
        release_date: item.release_date || item.first_air_date || "",
        first_air_date: item.first_air_date || item.release_date || "",
        overview: item.overview || "",
        genres: Array.isArray(item.genres) ? item.genres : [],
        addedAt: Date.now(),
      };

      const updated = [normalizedItem, ...library];
      saveLibrary(updated);
    },
    [library, isInLibrary, saveLibrary],
  );

  const removeFromLibrary = useCallback(
    (id, type) => {
      if (!id) return;
      const numId = Number(id);
      const updated = library.filter((item) => {
        const itemType =
          item.media_type ||
          item.type ||
          (item.first_air_date ? "tv" : "movie");
        const matchesId = Number(item.id) === numId;
        if (type) {
          return !(matchesId && itemType === type);
        }
        return !matchesId;
      });
      saveLibrary(updated);
    },
    [library, saveLibrary],
  );

  const toggleLibrary = useCallback(
    (item) => {
      if (!item || !item.id) return;
      const mediaType =
        item.media_type ||
        item.type ||
        (item.first_air_date ? "tv" : "movie") ||
        "movie";

      if (isInLibrary(item.id, mediaType)) {
        removeFromLibrary(item.id, mediaType);
      } else {
        addToLibrary(item);
      }
    },
    [isInLibrary, addToLibrary, removeFromLibrary],
  );

  const clearLibrary = useCallback(() => {
    saveLibrary([]);
  }, [saveLibrary]);

  return (
    <LibraryContext.Provider
      value={{
        library,
        libraryCount: library.length,
        addToLibrary,
        removeFromLibrary,
        isInLibrary,
        toggleLibrary,
        clearLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
