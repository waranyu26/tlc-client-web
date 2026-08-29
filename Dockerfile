# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app

# Railway forwards service variables into the Docker build ONLY if they are
# declared as ARG here. Vite inlines import.meta.env.* at build time, so any
# variable missing from this list is compiled in as `undefined`, and
# global-config.ts then falls back to its localhost defaults — a production
# bundle that silently points at http://localhost:3000. Keep this list in sync
# with src/global-config.ts.
ARG VITE_SERVER_URL
ARG VITE_WEBSITE_URL
ARG VITE_ST_API_BASE_PATH
ARG VITE_ASSETS_DIR
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_WEBSITE_URL=$VITE_WEBSITE_URL \
    VITE_ST_API_BASE_PATH=$VITE_ST_API_BASE_PATH \
    VITE_ASSETS_DIR=$VITE_ASSETS_DIR \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

ENV HUSKY=0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# yarn version comes from the `packageManager` field in package.json.
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
# `yarn build` is `tsc && vite build`, so this type-checks and lints the app as
# part of the image build: a type error fails the deploy instead of shipping.
RUN yarn build

# ---------- serve ----------
# Runtime carries only dist/ + Caddy: no node_modules, no Vite, no toolchain.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
