
import { Link } from "react-router-dom";
import { BookOpenIcon, ExternalLinkIcon, SparkleIcon } from "./Icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-col-brand">
            <Link
              to="/"
              className="footer-brand-title"
              aria-label="MStream Home"
            >
              <span className="brand-accent">M</span>STREAM
            </Link>

            <p className="footer-brand-desc">
              Your free cinematic portal for streaming trending movies, TV
              shows, and top-tier anime in ultra-crisp high definition.
            </p>

            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>Ultra-Fast Cinema Architecture</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/movies">Movies</Link>
              </li>
              <li>
                <Link to="/tv-shows">TV Shows</Link>
              </li>
              <li>
                <Link to="/popular">Popular</Link>
              </li>
              <li>
                <Link to="/library">My Library</Link>
              </li>
            </ul>
          </div>

          {/* Platform / Legal Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/about">About MStream</Link>
              </li>
              <li>
                <Link to="/disclaimer">Legal Disclaimer</Link>
              </li>
              <li>
                <a
                  href="https://github.com/cd-Crypton/mstream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-external-link"
                  title="MStream Open Source Repository on GitHub"
                >
                  GitHub Source <ExternalLinkIcon size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Explore Our Platforms */}
          <div className="footer-col footer-col-partner">
            <h4 className="footer-heading">
              <span className="partner-badge-glow">
                <SparkleIcon size={13} />
                Explore Our Platforms
              </span>
            </h4>

            {/* AI Drama */}
            <div className="footer-partner-card">
              <div className="partner-card-header">
                <div className="partner-icon-wrapper">
                  <SparkleIcon size={18} />
                </div>

                <div>
                  <a
                    href="https://aidrama.mstream.site/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-partner-title"
                    title="Watch AI Drama and Reels Online"
                  >
                    AI Drama <ExternalLinkIcon size={13} />
                  </a>

                  <span className="partner-subtitle">
                    Unlimited AI Drama &amp; Reels
                  </span>
                </div>
              </div>

              <p className="footer-partner-desc">
                Want to stream unlimited AI Drama &amp; Reels? Dive into
                AI-powered dramas, captivating stories, and bite-sized
                entertainment. Discover something new with every episode.
              </p>

              <a
                href="https://aidrama.mstream.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-partner-cta"
                title="Stream AI Drama and Reels Online"
              >
                <span>Watch AI Drama</span>
                <span className="partner-arrow">&rarr;</span>
              </a>
            </div>

            {/* PanelRift */}
            <div className="footer-partner-card">
              <div className="partner-card-header">
                <div className="partner-icon-wrapper">
                  <BookOpenIcon size={18} />
                </div>

                <div>
                  <a
                    href="https://panelrift.eu.cc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-partner-title"
                    title="Read Free Manhwa, Manga, and Webtoons Online at PanelRift"
                  >
                    PanelRift <ExternalLinkIcon size={13} />
                  </a>

                  <span className="partner-subtitle">
                    Free Manhwa &amp; Manga Reader
                  </span>
                </div>
              </div>

              <p className="footer-partner-desc">
                Love anime adaptations? Dive into original source webtoons.
                Read thousands of free Manhwa chapters with daily updates
                and pristine HD vertical scans.
              </p>

              <a
                href="https://panelrift.eu.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-partner-cta"
                title="Read Free Manhwa and Manga Online on PanelRift"
              >
                <span>Read Manhwa Online</span>
                <span className="partner-arrow">&rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} MSTREAM. Curated for cinema &amp; entertainment
            enthusiasts.
          </p>

          <div className="footer-bottom-links">
            <Link to="/about">About</Link>
            <span className="footer-dot">•</span>

            <Link to="/disclaimer">Disclaimer</Link>
            <span className="footer-dot">•</span>

            <a
              href="https://aidrama.mstream.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-backlink-highlight"
              title="AI Drama - Stream Unlimited AI Drama and Reels"
            >
              AI Drama
            </a>

            <span className="footer-dot">•</span>

            <a
              href="https://panelrift.eu.cc/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-backlink-highlight"
              title="PanelRift - Read Free Manhwa & Webtoons Online"
            >
              PanelRift Manhwa
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
