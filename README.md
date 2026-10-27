# play.saigame.studio

Player-facing web app for Sai Game (Next.js 16, Tailwind CSS 3). It uses the same ss-go backend and the same
accounts as the Studio site, with single sign-on through a shared refresh-token cookie on `.saigame.studio`.

## Local development

1. Add to your hosts file: `127.0.0.1 local-play.saigame.studio`
2. `cp .env.example .env.local` and adjust values.
3. In ss-go `.env`: set `AUTH_COOKIE_DOMAIN=.saigame.studio` (the API must run on `local-api.saigame.studio`).
4. `npm install` then `npm run dev` → http://local-play.saigame.studio:83

## Environments

| Env        | Site                              | API                              |
|------------|-----------------------------------|----------------------------------|
| local      | http://local-play.saigame.studio:83 | http://local-api.saigame.studio:82 |
| qa         | https://qa-play.saigame.studio    | https://qa-api.saigame.studio    |
| production | https://play.saigame.studio       | https://api.saigame.studio       |

The site must be served from a `*.saigame.studio` host, otherwise the SSO cookie is not sent. Add each site origin to the
Google OAuth client's "Authorized JavaScript origins".
