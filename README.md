# Jellyfin TV Launcher

<https://jellyfin-tv-launcher.vercel.app>

## English

Small Smart TV / VIDAA launcher, not Jellyfin client. `jellyfin-web` is not included. On startup launcher checks saved Jellyfin server, then redirects TV directly to server's `/web/`; launcher never needs synchronizing with Jellyfin releases.

Only Jellyfin base server URL is stored locally in browser `localStorage`. No credentials, tokens, API keys, analytics, proxying, or external runtime dependencies.

HTTPS Jellyfin URL is recommended. HTTP address requires confirmation and should only be used on local network. Browser mixed-content rules prevent this HTTPS launcher from checking whether an HTTP Jellyfin server is available before redirecting. Deployment runs from `main` through Vercel Git integration when integration is connected.

Launcher uses static browser localization: Russian for `ru*` locales, English for all other locales and locale-detection failures. No backend or translation requests are required.

Saved servers open automatically. To change a saved address, press any remote button during startup splash or server check; launcher cancels redirect and shows connection form with saved address.

## Русский

Небольшой launcher для Smart TV / VIDAA, а не клиент Jellyfin. `jellyfin-web` не включён. При запуске launcher проверяет сохранённый сервер Jellyfin и перенаправляет телевизор на `/web/` сервера; синхронизировать launcher с релизами Jellyfin не требуется.

В `localStorage` браузера сохраняется только базовый URL сервера Jellyfin. Учётные данные, токены, API-ключи, аналитика, проксирование и внешние runtime-зависимости не используются.

Рекомендуется HTTPS-адрес Jellyfin. HTTP-адрес требует подтверждения и должен использоваться только в локальной сети. Браузеры блокируют проверку HTTP-сервера из HTTPS launcher как mixed content, поэтому до перенаправления нельзя определить доступность HTTP-сервера. Деплой из `main` выполняется через Vercel Git integration.

Локализация статическая: русский язык используется для locale `ru*`, английский — для остальных locale и ошибок определения языка. Backend и запросы переводов не требуются.

Сохранённые серверы открываются автоматически. Чтобы изменить сохранённый адрес, нажмите любую кнопку пульта во время splash или проверки сервера: launcher отменит перенаправление и покажет форму подключения с сохранённым адресом.
