# MSTREAM Architecture & Technical Design

This document details the software architecture, caching tiers, rate limiting mechanisms, session management, and state synchronization across MSTREAM.

---

## 🏛️ High-Level System Overview

MSTREAM is structured as a client-first, edge-accelerated Single Page Application (SPA). It decouples video metadata extraction from stream playback, routing all API metadata requests through a tiered cache and proxy architecture while serving stream iframes through a sandboxed multi-provider engine.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                │
│                                                                         │
│  ┌───────────────────────┐             ┌─────────────────────────────┐  │
│  │   React 19 Views      │             │     LibraryContext          │  │
│  │ (Home, Catalog, Watch)│             │ (localStorage + cross-tab)  │  │
│  └───────────┬───────────┘             └──────────────┬──────────────┘  │
│              │                                        │                 │
│              ▼                                        ▼                 │
│  ┌───────────────────────┐             ┌─────────────────────────────┐  │
│  │       useTMDB         │             │      sessionManager         │  │
│  └───────────┬───────────┘             │  (Device ID / Anonymous)    │  │
│              │                         └─────────────────────────────┘  │
│              ▼                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Tier 1: In-Memory Cache (0ms Map lookup + In-flight deduplication) │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │ (cache miss)                     │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Tier 2: sessionStorage (Browser tab cache with TTL)               │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │ (cache miss)                     │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Token-Bucket Rate Limiter (12 req/sec max + exponential backoff)  │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       │ HTTP /api/proxy
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge Network                           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Cloudflare Pages Function (functions/api/[[path]].js)             │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │                                  │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Tier 3: Cloudflare Cache API (caches.default, 1 hour edge TTL)    │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       │ (edge miss)
                                       ▼
                        ┌──────────────────────────────┐
                        │   The Movie Database (TMDB)  │
                        └──────────────────────────────┘
```

---

## ⚡ Tiered Caching Strategy

To minimize API latency, avoid rate limits from TMDB, and ensure instantaneous page navigation, MSTREAM employs a 3-tier caching hierarchy:

### Tier 1: In-Memory Map (`src/services/apiCache.js`)
- **Storage**: In-memory JavaScript `Map` held in browser application state.
- **Latency**: `0ms`.
- **Scope**: Active tab session.
- **Use Case**: Instant response when flipping between pages, opening/closing detail modals, switching trending tabs, and navigating back/forward in history.
- **Cleanup**: Periodic garbage collection of expired timestamps.

### Tier 2: `sessionStorage` (`src/services/apiCache.js`)
- **Storage**: Browser `window.sessionStorage`.
- **Latency**: `< 2ms`.
- **Scope**: Preserved across page reloads (F5) within the same browser tab.
- **Auto-Promotion**: On a Tier 1 miss, if found in Tier 2, the entry is promoted back to Tier 1 for subsequent instantaneous reads.

#### Cache TTL Matrix

| Data Type | TTL Duration | Examples |
| :--- | :--- | :--- |
| **SHORT** | 5 minutes | Search queries and suggestions |
| **MEDIUM** | 20 minutes | Trending movies, trending TV, Now Playing |
| **LONG** | 1 hour | Movie/show details, credits, cast, recommendations |
| **STATIC** | 24 hours | Genre lists, configuration, certifications |

### Tier 3: Cloudflare Edge Cache (`functions/api/[[path]].js`)
- **Storage**: Cloudflare Edge `caches.default` Cache API.
- **Headers**:
  - `Cache-Control: public, max-age=3600, s-maxage=3600`
  - `X-Cache-Status: HIT` or `X-Cache-Status: MISS`
- **Scope**: Shared globally across all users accessing the same Cloudflare data center edge.

---

## 🔄 In-Flight Request Deduplication

When multiple components mount concurrently (such as the Hero Banner, Category Row, and Modal simultaneously needing genre IDs or trending data), they might initiate duplicate HTTP requests for identical URLs.

`apiCache.js` maintains an `inFlightRequests` Map:
```javascript
const inFlightRequests = new Map();

// If a request for this key is already in-flight, return the existing Promise
if (inFlightRequests.has(cacheKey)) {
  return inFlightRequests.get(cacheKey);
}
```
All callers share the same network Promise. Once resolved, the promise is evicted from the in-flight map and the data is placed into Tier 1 and Tier 2 caches.

---

## 🚦 Client-Side Rate Limiter & Backoff

To prevent bursts of traffic from overwhelming upstream providers, `src/services/rateLimiter.js` implements a **Token-Bucket Algorithm**:

- **Capacity**: 12 tokens.
- **Refill Rate**: 12 tokens per second (0.012 tokens/ms).
- **Behavior**:
  - Each outgoing network call requests a token via `rateLimiter.acquire()`.
  - If tokens are available, the call proceeds immediately.
  - If the bucket is exhausted, requests queue up and resolve as tokens refill.
- **Exponential Backoff**:
  - If an upstream `429 Too Many Requests` status code is encountered, the rate limiter enters backoff mode (`backoffDelay`), pausing subsequent executions until the cooldown window expires.

---

## 📚 Account-Free Persistent Library

The Library system allows users to bookmark movies and TV shows without creating an account or logging in.

### 1. Storage Layer (`src/context/LibraryContext.jsx`)
- Stored in browser `localStorage` under key `mstream_library`.
- Saves lightweight metadata: `id`, `title`, `name`, `poster_path`, `backdrop_path`, `vote_average`, `release_date`, `first_air_date`, `media_type`, and `savedAt`.

### 2. Live Cross-Tab Synchronization
Users often browse streaming sites with multiple tabs open. When an item is added or removed in Tab A:
```javascript
window.addEventListener("storage", (event) => {
  if (event.key === "mstream_library") {
    // Reload state from new localStorage payload
    loadLibraryFromStorage();
  }
});
```
Tab B immediately receives the `storage` event, updates React state, and updates the live counter badge in the navbar without a page reload.

---

## 👤 Anonymous Session Management (`src/services/sessionManager.js`)

MSTREAM respects user privacy: no trackers, third-party analytics cookies, or personal logins.
To provide personalization (such as remembering recent volume, playback servers, or sort preferences):
- **Device Identifier (`deviceId`)**: A cryptographically random UUID generated once and persisted in `localStorage` (`mstream_device_id`).
- **Session Identifier (`sessionId`)**: A UUID generated per browser session and stored in `sessionStorage` (`mstream_session_id`).
- **Activity Timestamp**: Updates last active time to assist with cache invalidation and local state freshness.

---

## 🎬 Multi-Server Playback Architecture

Located in `src/pages/Watch.jsx`, the player architecture isolates third-party embed video providers:

1. **Provider Isolation**: Third-party iframe sources are rendered within sandboxed wrappers with configurable `allow` attributes (`encrypted-media`, `fullscreen`, `picture-in-picture`).
2. **Failover Controls**: Quick-switching server pills let viewers jump to alternate mirrors if a provider experiences buffering or DMCA takedowns.
3. **Episode Navigation**: For TV series, season and episode selectors update URL parameters (`?season=X&episode=Y`), triggering synchronized iframe source updates.

---

## 📱 Progressive Web App (PWA) Offline Strategy

Configured via `vite-plugin-pwa` in `vite.config.js`:
- **Strategy**: `generateSW` with Workbox runtime.
- **Precaching**: 41+ assets (HTML, CSS, JS, SVG, WebManifest, logos) are precached into the Cache Storage API on initial load.
- **Offline Shell**: The application shell boots offline, displaying cached catalog titles or an informative connection status indicator.
