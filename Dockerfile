# Self-Sovereign Identity
#
# Multi-stage build that:
#   - creates a production build of the frontend
#   - compiles the backend (TypeScript -> JavaScript)
#   - creates a clean Node alpine container which imports the builds and then starts the server
#
# Required ARG variables:
#   - APP_PUBLIC_URL
#   - EBSI_ENV ("local", "integration", "development", "production")
#
# Optional ARG variables:
#   - EBSI_DEMONSTRATOR_URL
#   - EBSI_WALLET_WEB_CLIENT_URL
#
# Internal ARGs, do NOT override:
#   - PUBLIC_URL
#   - REACT_APP_DEMONSTRATOR_URL
#   - REACT_APP_WALLET_WEB_CLIENT_URL
#   - REACT_APP_BACKEND_EXTERNAL_URL
#
# Required ENV variables:
#   - EBSI_ENV ("local", "integration", "development", "production")
#   - APP_ISSUER
#   - APP_PRIVATE_KEY (hex key)
#
# Optional ENV variables:
#   - NODE_ENV ("development" or "production" ; default: "production")
#   - APP_PORT (default: 8080)
#   - APP_PUBLIC_URL (default: set in code, depends on EBSI_ENV)
#   - EBSI_WALLET_API (default: set in code, depends on EBSI_ENV)
#   - EBSI_WALLET_WEB_CLIENT_URL (default: set in code, depends on EBSI_ENV)
#   - LOG_LEVEL ("error", "warn", "info", "verbose" or "debug" ; default: set in code, depends on EBSI_ENV)

# Stage 0: prepare node alpine image
FROM node:12-alpine AS base
RUN apk add --update --no-cache \
  python \
  make \
  g++

# Stage 1: build ESSIF frontend
FROM base AS builder-frontend
WORKDIR /usr/src/app
COPY ./packages/essif-frontend/package*.json /usr/src/app/
RUN npm ci --quiet --no-progress
COPY ./packages/essif-frontend /usr/src/app/
# Import ARGs
ARG APP_PUBLIC_URL
ARG EBSI_ENV
ARG EBSI_DEMONSTRATOR_URL
ARG EBSI_WALLET_WEB_CLIENT_URL
# Create-React-App configuration
# https://create-react-app.dev/docs/advanced-configuration
ARG PUBLIC_URL=${APP_PUBLIC_URL}
# Required custom ARGs
ARG REACT_APP_EBSI_ENV=${EBSI_ENV}
# Optional custom ARGs
ARG REACT_APP_DEMONSTRATOR_URL=${EBSI_DEMONSTRATOR_URL}
ARG REACT_APP_WALLET_WEB_CLIENT_URL=${EBSI_WALLET_WEB_CLIENT_URL}
ARG REACT_APP_BACKEND_EXTERNAL_URL=${APP_PUBLIC_URL}
RUN npm run build

# Stage 2: build ESSIF backend
FROM base AS builder-backend
WORKDIR /usr/src/app
COPY ./packages/essif-backend/package*.json /usr/src/app/
RUN npm ci --quiet --no-progress
COPY ./packages/essif-backend /usr/src/app/
RUN npm run build && npm prune --production

# Stage 3: run light app
FROM node:12.16.1-alpine
WORKDIR /usr/src/app
COPY --from=builder-backend /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder-backend /usr/src/app/dist /usr/src/app/dist
COPY --from=builder-frontend /usr/src/app/build /usr/src/app/public
COPY ./packages/essif-backend/package*.json /usr/src/app/
COPY ./packages/essif-backend/scripts/start.sh /usr/src/app/scripts/start.sh
USER node
ENV NODE_ENV production
CMD sh scripts/start.sh
