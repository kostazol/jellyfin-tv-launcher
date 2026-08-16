# Jellyfin TV Launcher

<https://jellyfin-tv-launcher.vercel.app>

Small Smart TV / VIDAA launcher, not Jellyfin client. `jellyfin-web` is not included. On startup launcher checks saved Jellyfin server, then redirects TV directly to server's `/web/`; launcher never needs synchronizing with Jellyfin releases.

Only Jellyfin base server URL is stored locally in browser `localStorage`. No credentials, tokens, API keys, analytics, proxying, or external runtime dependencies.

HTTPS Jellyfin URL is recommended. HTTP address requires confirmation and should only be used on local network; HTTPS launcher cannot validate HTTP server before redirect because browsers block mixed-content requests. Deployment runs from `main` through Vercel Git integration when integration is connected.

Launcher uses static browser localization: Russian for `ru*` locales, English for all other locales and locale-detection failures. No backend or translation requests are required.
