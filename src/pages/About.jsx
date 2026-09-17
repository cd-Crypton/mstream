import { Link } from "react-router-dom";
import {
  FlameIcon,
  SearchIcon,
  TvIcon,
  SparkleIcon,
  GitHubIcon,
} from "../components/Icons";

const About = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>About MStream</h1>

        <div className="about-content">
          <section className="about-section">
            <h2>Welcome to MStream</h2>
            <p>
              Welcome to MStream, your favorite destination for exploring the
              vast world of movies, TV series, and anime. Our mission is to
              provide an elegant, ultra-fast, user-friendly interface for
              discovering new content, tracking trending titles, and enjoying an
              immersive cinema viewing experience.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Technology</h2>
            <p>
              This platform was built using modern web architecture including
              React, Vite, and Cloudflare Pages to provide high-speed, dynamic,
              and responsive streaming discovery. We source real-time metadata
              from The Movie Database (TMDB) API to ensure up-to-date and
              accurate entertainment details.
            </p>
          </section>

          <section className="about-section">
            <h2>Key Highlights</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FlameIcon size={26} fill="currentColor" />
                </div>
                <h3>Trending Catalog</h3>
                <p>
                  Discover the most popular movies and TV shows updated in
                  real-time
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <SearchIcon size={24} />
                </div>
                <h3>Instant Search</h3>
                <p>
                  Find your favorite movies and actors across comprehensive
                  catalogs
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <TvIcon size={24} />
                </div>
                <h3>Multi-Screen Responsive</h3>
                <p>
                  Flawlessly optimized for desktop, tablets, and mobile screens
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <SparkleIcon size={24} />
                </div>
                <h3>OLED Cinema Design</h3>
                <p>
                  Curated dark-mode aesthetic with ambient lighting and high
                  contrast
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Commitment</h2>
            <p>
              We are committed to providing an exceptional discovery interface
              while respecting content creators. We encourage all users to
              support the entertainment industry by watching and subscribing
              through official studios and licensed distribution services.
            </p>
          </section>

          <section className="about-section contact-section">
            <h2>Get In Touch</h2>
            <p>
              Have suggestions, feedback, or ideas? We would love to
              collaborate!
            </p>
            <div className="contact-info">
              <p
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <GitHubIcon size={20} />
                <span>GitHub: </span>
                <a
                  href="https://github.com/cd-Crypton/mstream"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/cd-Crypton/mstream
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="static-links">
          <Link to="/disclaimer" className="static-link">
            View Legal Disclaimer
          </Link>
          <Link to="/" className="static-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
