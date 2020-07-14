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
FROM node:12.16.1-alpine AS base
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/package.json
COPY ./yarn.lock /usr/src/app/yarn.lock
COPY ./packages/essif-backend/package.json /usr/src/app/packages/essif-backend/package.json
COPY ./packages/essif-frontend/package.json /usr/src/app/packages/essif-frontend/package.json
RUN yarn install --frozen-lockfile --silent --production && yarn cache clean

# Stage 1: build frontend and backend
FROM base AS builder
WORKDIR /usr/src/app
# Install dev dependencies as well
RUN yarn install --frozen-lockfile --silent
# 1.1: build ESSIF backend
COPY ./packages/essif-frontend /usr/src/app/packages/essif-frontend/
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
RUN cd packages/essif-frontend && yarn build
# 1.2: build ESSIF backend
COPY ./packages/essif-backend /usr/src/app/packages/essif-backend/
RUN cd packages/essif-backend && yarn build

# Stage 3: run light app
FROM base
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/packages/essif-backend/dist /usr/src/app/packages/essif-backend/dist
COPY --from=builder /usr/src/app/packages/essif-frontend/build /usr/src/app/packages/essif-backend/public
COPY ./packages/essif-backend/scripts/start.sh /usr/src/app/packages/essif-backend/scripts/start.sh
USER node
ENV NODE_ENV production
CMD cd packages/essif-backend && sh scripts/start.sh
