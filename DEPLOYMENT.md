# Rida Admin Frontend Deployment

This repository builds the static admin app into an unprivileged Nginx container. The container listens on port 8080 internally and publishes only to `127.0.0.1:4173` by default. Terminate HTTPS at the VPS reverse proxy.

## Build and run

Set `VITE_API_BASE_URL=https://rida-backend.ditronics.co.tz/api/v1` in the deployment environment, then run:

```sh
docker compose config -q
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=100
```

The frontend reads its API URL at build time. Rebuild the image after changing it. Do not put backend credentials in frontend environment variables; Vite variables are public in the browser bundle.

## VPS reverse proxy

Configure the existing VPS reverse proxy for `admin.rida.ditronics.co.tz` to forward HTTP traffic to `http://127.0.0.1:4173`, preserving the `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers. Obtain and renew the TLS certificate with the VPS certificate manager. Keep the backend API on its own hostname and allow `https://admin.rida.ditronics.co.tz` in the backend's `CORS_ALLOWED_ORIGINS` setting.

Do not replace existing proxy configuration until its active virtual hosts and certificates have been inspected on the VPS.
