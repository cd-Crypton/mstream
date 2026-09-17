import { Link } from "react-router-dom";
import { WarningIcon } from "../components/Icons";

const Disclaimer = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>Disclaimer</h1>

        <div className="disclaimer-content">
          <section className="disclaimer-section">
            <h2>Content Notice</h2>
            <p>
              <strong>
                MStream does not host any video files on its servers.
              </strong>{" "}
              All content indexed or presented on this platform is sourced from
              non-affiliated third parties. The application acts as a discovery
              and playback interface for content publicly accessible across the
              web.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Intellectual Property & Liability</h2>
            <p>
              We do not accept responsibility for content hosted on external
              third-party servers and shall have no liability in respect of any
              such content. All trademarks, media assets, posters, titles, and
              copyrights belong to their respective production companies,
              studios, and rights holders.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Educational & Demonstration Use</h2>
            <p>
              This site is provided for educational demonstration of modern
              single-page web applications. MStream is an experimental project
              and is not intended as a commercial subscription service.
            </p>
            <p>
              <strong>
                We strongly encourage users to support the creative community
                and entertainment industry by watching content through official
                licensed platforms.
              </strong>
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>User Responsibility</h2>
            <p>Users of MStream are solely responsible for:</p>
            <ul className="responsibility-list">
              <li>
                Complying with local jurisdiction laws and regulations regarding
                streaming content
              </li>
              <li>
                Ensuring lawful rights to access content in their geographic
                territory
              </li>
              <li>
                Supporting independent artists and content creators through
                official channels
              </li>
            </ul>
          </section>

          <section className="disclaimer-section">
            <h2>Technical Information</h2>
            <p>
              MStream utilizes The Movie Database (TMDB) API for movie and TV
              show information, including titles, descriptions, ratings, cast
              lists, poster artwork, and release dates. This data is utilized
              under the terms of TMDB API guidelines.
            </p>
          </section>

          <section className="disclaimer-section warning-section">
            <div className="warning-banner">
              <h3>
                <WarningIcon size={20} />
                Important Notice
              </h3>
              <p>
                The developers of MStream are not responsible for any issues
                that may arise from the use of this application. Users must
                ensure compliance with all applicable laws in their territory.
              </p>
            </div>
          </section>

          <section className="disclaimer-section support-section">
            <h2>Support Official Platforms</h2>
            <p
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "var(--text-secondary)",
              }}
            >
              Support filmmakers and creators by subscribing to official
              streaming services:
            </p>
            <div className="platform-list">
              <a
                href="https://netflix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="platform-link"
              >
                Netflix
              </a>
              <a
                href="https://hulu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="platform-link"
              >
                Hulu
              </a>
              <a
                href="https://disneyplus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="platform-link"
              >
                Disney+
              </a>
              <a
                href="https://max.com"
                target="_blank"
                rel="noopener noreferrer"
                className="platform-link"
              >
                Max
              </a>
              <a
                href="https://amazon.com/primevideo"
                target="_blank"
                rel="noopener noreferrer"
                className="platform-link"
              >
                Prime Video
              </a>
            </div>
          </section>
        </div>

        <div className="static-links">
          <Link to="/about" className="static-link">
            About Us
          </Link>
          <Link to="/" className="static-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
