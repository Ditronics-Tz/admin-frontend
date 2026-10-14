FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://rida-backend.ditronics.co.tz/api/v1
ARG VITE_DOCUMENT_ORIGIN=
ARG VITE_PUBLIC_IMAGE_ORIGIN=
ARG VITE_MAP_TILE_URL=
ARG VITE_MAP_ATTRIBUTION=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_DOCUMENT_ORIGIN=${VITE_DOCUMENT_ORIGIN} \
    VITE_PUBLIC_IMAGE_ORIGIN=${VITE_PUBLIC_IMAGE_ORIGIN} \
    VITE_MAP_TILE_URL=${VITE_MAP_TILE_URL} \
    VITE_MAP_ATTRIBUTION=${VITE_MAP_ATTRIBUTION} \
    VITE_ENABLE_DEMO_MODE=false \
    VITE_API_MODE=live \
    VITE_APP_ENV=production

RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist/ /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
