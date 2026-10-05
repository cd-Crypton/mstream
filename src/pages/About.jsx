import { Link } from "react-router-dom";
import {
  FlameIcon,
  SearchIcon,
  TvIcon,
  SparkleIcon,
  GitHubIcon,
  BookOpenIcon,
  ExternalLinkIcon,
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

          {/* Featured Entertainment Partner / SEO Backlink: PanelRift */}
          <section className="about-section about-partner-section">
            <div className="partner-header-tag">
              <SparkleIcon size={16} />
              <span>Recommended Reading Partner</span>
            </div>
            <h2>Discover Original Webtoons &amp; Comics on PanelRift</h2>
            <p>
              Anime series and Asian cinema adaptations often originate from legendary webtoons, manhwa, and manga stories. If you enjoy the storylines streaming on MStream, explore the original serialized releases on our featured reading partner platform:{" "}
              <a
                href="https://panelrift.eu.cc/"
                target="_blank"
                rel="noopener"
                className="about-inline-partner-link"
                title="Read Free Manhwa and Manga Online on PanelRift"
              >
                <strong>PanelRift (Free Manhwa &amp; Webtoons Reader)</strong>
              </a>
              .
            </p>

            <div className="partner-spotlight-card">
              <div className="partner-spotlight-header">
                <div className="partner-spotlight-icon">
                  <BookOpenIcon size={28} />
                </div>
                <div>
                  <span className="partner-badge-pill">Sister Platform</span>
                  <h3 className="partner-spotlight-title">
                    PanelRift &mdash; Read Free Manhwa &amp; Manga Online
                  </h3>
                </div>
              </div>

              <p className="partner-spotlight-desc">
                PanelRift is dedicated to webtoon lovers, hosting an extensive catalog of Korean manhwa, Japanese manga, and Chinese manhua across fantasy, action, reincarnation (isekai), romance, and martial arts (murim) genres.
              </p>

              <div className="partner-perks-grid">
                <div className="partner-perk-item">
                  <span className="perk-bullet">⚡</span>
                  <div>
                    <strong>Daily Chapter Drops</strong>
                    <p>Read trending manhwa chapters the moment they are translated and scanned.</p>
                  </div>
                </div>
                <div className="partner-perk-item">
                  <span className="perk-bullet">📱</span>
                  <div>
                    <strong>Mobile-Optimized Reader</strong>
                    <p>Seamless vertical continuous scroll designed for iPhone, Android, and tablets.</p>
                  </div>
                </div>
                <div className="partner-perk-item">
                  <span className="perk-bullet">🎨</span>
                  <div>
                    <strong>High-Definition Art</strong>
                    <p>Pristine uncompressed color images bringing illustrations to life.</p>
                  </div>
                </div>
              </div>

              <div className="partner-action-box">
                <a
                  href="https://panelrift.eu.cc/"
                  target="_blank"
                  rel="noopener"
                  className="partner-cta-button"
                  title="Read Free Manhwa, Manga, and Webtoons Online at PanelRift"
                >
                  <span>Start Reading on PanelRift</span>
                  <ExternalLinkIcon size={18} />
                </a>
                <span className="partner-cta-note">100% Free • No Mandatory Registration</span>
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
