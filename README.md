# Jellyfin TV Launcher

<https://jellyfin-tv-launcher.vercel.app>

Small Smart TV / VIDAA launcher, not Jellyfin client. `jellyfin-web` is not included. On startup launcher checks saved Jellyfin server, then redirects TV directly to server's `/web/`; launcher never needs synchronizing with Jellyfin releases.

Only Jellyfin base server URL is stored locally in browser `localStorage`. No credentials, tokens, API keys, analytics, proxying, or external runtime dependencies.

Use HTTPS Jellyfin URL because Vercel launcher is HTTPS. Deployment runs from `main` through Vercel Git integration when integration is connected.
