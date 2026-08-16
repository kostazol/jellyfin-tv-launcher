# Agent Instructions

## Project

This repository contains **Jellyfin TV Launcher**, a tiny static launcher intended primarily for Smart TV / Hisense VIDAA browsers.

- Repository: `kostazol/jellyfin-tv-launcher`
- Production branch: `main`
- Vercel project: `jellyfin-tv-launcher`
- Production URL: `https://jellyfin-tv-launcher.vercel.app`

The launcher is **not** a Jellyfin client and must not embed or ship `jellyfin-web`. It only stores a Jellyfin server base URL, checks `/System/Info/Public`, and redirects the top-level browser window to the server's `/web/`.

## Architecture constraints

Keep the project deliberately small and static:

- plain HTML, CSS, and vanilla JavaScript;
- no React, Next.js, framework runtime, or application npm dependencies;
- no Vercel Functions or other backend;
- no reverse proxy and no media/API proxying through Vercel;
- no iframe;
- no analytics or telemetry;
- no external runtime JS/CSS/font dependencies;
- do not store Jellyfin credentials, tokens, API keys, or user IDs;
- `localStorage` may contain only the Jellyfin base server URL.

Preserve compatibility with older Smart TV browsers. Prefer simple browser APIs and graceful fallbacks over modern abstractions.

## Localization

The launcher uses static in-browser localization with no backend or translation requests. It uses Russian for `ru*` browser locales and English for every other locale and all locale-detection errors.

## Important UX behavior

Preserve the TV startup experience:

- show the full-screen Jellyfin splash immediately on page load;
- keep the approximately 1500 ms fade/scale startup animation;
- when a server URL is already saved, start the availability check in parallel with the splash;
- if the server is valid, redirect with `window.location.replace(serverUrl + '/web/')` without requiring user input;
- if no server is configured or the saved server is unavailable, show the connection form;
- manual Connect should show an immediate loading state while validating the server.

Do not add artificial delay beyond the deliberate startup splash.

## Deployment workflow

**Vercel Git integration is already configured and has been verified.**

A push to `origin/main` automatically creates a **production deployment** for:

`https://jellyfin-tv-launcher.vercel.app`

Therefore the normal release workflow is:

1. Inspect the current repository and existing changes.
2. Implement and review the change.
3. Commit the intended files.
4. Push to `origin/main`.
5. Let the Vercel GitHub integration deploy the commit automatically.
6. Verify the production URL/assets reflect the pushed commit.

Do **not** run `vercel deploy`, create another Vercel project, change the production domain, or require a Vercel token for normal development/release work.

For non-production experimentation, prefer a branch/PR rather than manually replacing production. Vercel Git integration can create preview deployments for non-production branches.

## Production verification

After a production push, verify at minimum:

- `https://jellyfin-tv-launcher.vercel.app` returns the launcher rather than a placeholder;
- required static assets such as `/app.js`, `/styles.css`, and `/assets/jellyfin-banner.svg` return successfully;
- there are no unexpected backend/function routes;
- the startup splash and connection form still work as intended.

If deployment verification tools are available, confirm the Vercel deployment is `READY`. If Vercel tooling is unavailable locally, the Git push is still sufficient to trigger deployment; verify the public production URL directly.

## Git safety

- Do not force-push `main`.
- Do not overwrite unrelated user changes.
- Do not commit credentials, Vercel tokens, generated auth state, or `.vercel` secrets/config that contain account-specific authentication data.
- Keep commits focused and descriptive.
