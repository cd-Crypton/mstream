import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Popular from "./pages/Popular";
import Watch from "./pages/Watch";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import { useTMDB } from "./hooks/useTMDB";
import Footer from "./components/Footer";
import Library from "./pages/Library";
import { LibraryProvider } from "./context/LibraryContext";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTMDB } = useTMDB();
  const navigate = useNavigate();

  useEffect(() => {
    // Gracefully dismiss initial splash screen as soon as React mounts the application
    if (typeof window.dismissAppSplash === "function") {
      requestAnimationFrame(() => {
        window.dismissAppSplash();
      });
    }
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTMDB(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemClick = (item) => {
    // Navigate to watch page with item details
    if (item && item.id && (item.media_type || item.type)) {
      const type = item.media_type || item.type;
      navigate(`/watch?type=${type}&id=${item.id}`);
      setSearchResults([]); // Clear search results when item is clicked
    }
  };

  return (
    <LibraryProvider>
      <div className="App">
        <Navbar
          onSearch={handleSearch}
          searchResults={searchResults}
          onItemClick={handleItemClick}
          isSearching={isSearching}
        />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/library" element={<Library />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/about" element={<About />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </LibraryProvider>
  );
}

export default App;
