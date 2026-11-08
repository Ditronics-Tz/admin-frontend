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

## Continuous delivery

Develop on `dev`, then merge into `main`. `.github/workflows/ci.yml` runs typecheck, lint, and the production build only for pushes to `main` and pull requests targeting `main`. Tests are excluded under the project's code-only rule. That same `main` push deploys after the checks pass. Pushes to `dev` do not start this workflow, so they do not leave a skipped deploy job.

The existing repository secrets `RIDA_DEPLOY_KEY` and `RIDA_DEPLOY_KNOWN_HOSTS` authenticate SSH with strict host-key verification. The workflow sends `admin <commit SHA>` to the restricted server entrypoint. It verifies that SHA is still current main, fast-forwards the clean `/opt/rida-admin-frontend` checkout, preserves the running image as `rida-admin-frontend:previous`, builds the replacement, and waits for container health. A shared host lock prevents simultaneous backend/admin deployment. The workflow then checks the public HTTPS `/healthz` endpoint. The API and database are not replaced by admin delivery.

To retry, select **Actions → CI/CD → Run workflow → main**, or rerun the failed main run. Superseded revisions are skipped. Do not include `[skip ci]` in release merge messages. No additional GitHub secret is needed on the currently configured host.

The shared server entrypoint is maintained in the backend repository at `deploy/gha-remote.sh`, installed as `/usr/local/sbin/rida-gha-deploy`. Changes to that entrypoint require operator installation; it no longer overwrites itself during deployments. See the backend's `deploy/README.md` for setup, backup and failure recovery. Failed builds preserve the current service; failed startup requires investigation or a corrective release. Successful commit IDs are recorded at `/var/lib/rida-deploy/admin.sha`.
