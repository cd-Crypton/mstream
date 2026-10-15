#!/bin/sh
set -e

# Support either TMDB_READ_ACCESS_TOKEN or VITE_TMDB_READ_ACCESS_TOKEN
export TMDB_TOKEN="${TMDB_READ_ACCESS_TOKEN:-$VITE_TMDB_READ_ACCESS_TOKEN}"
export PORT="${PORT:-80}"

if [ -z "$TMDB_TOKEN" ]; then
  echo "================================================================="
  echo "⚠️  WARNING: TMDB_READ_ACCESS_TOKEN is not configured!"
  echo "Catalog data, search, and details from TMDB will not load."
  echo "Please set your TMDB Read Access Token via environment variable:"
  echo "  -e TMDB_READ_ACCESS_TOKEN=\"your_token_here\""
  echo "================================================================="
else
  echo "✓ TMDB Read Access Token detected. Setting up API reverse proxy."
fi

# Substitute only PORT and TMDB_TOKEN, strictly preserving all internal Nginx variables ($uri, $remote_addr, etc.)
envsubst '$PORT $TMDB_TOKEN' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Execute CMD (starts nginx)
exec "$@"
