# ==============================================================================
# MSTREAM - MULTI-STAGE DOCKERFILE FOR UNIVERSAL SELF-HOSTING
# Stage 1: Build static assets using Node.js 20 & pnpm
# Stage 2: Serve via ultra-lightweight Nginx Alpine with built-in API proxy
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. BUILD STAGE
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package dependency definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies strictly matching the lockfile
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Compile optimized production bundle to /app/dist
RUN pnpm run build

# ------------------------------------------------------------------------------
# 2. RUNTIME STAGE
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Install curl for container health checks and dos2unix for line-ending normalization
RUN apk add --no-cache curl dos2unix

# Clean default Nginx web root
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx template and entrypoint script
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Ensure executable permissions and UNIX line endings (prevents Windows CRLF errors)
RUN dos2unix /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Default listening port (sensitive tokens should only be supplied at runtime via -e or compose)
ENV PORT=80

EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
