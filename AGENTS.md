# Frontend Rules (play.saigame.studio)

Player-facing site. Shares the ss-go backend and the user account with the Studio site (`server.saigame.studio`).

- Never infer or introduce new product concepts, requirements, terminology, data models, or behavior. State what is verified and ask the user when a decision is required.
- Keep `.tsx` files ≤700 lines and other files ≤1000 lines; split before exceeding the limit. Keep UI, logic, hooks, API, and types in focused modules.
- Every JSX/HTML element needs a feature-scoped, kebab-case `id` and a matching class name with the same value in `className` (e.g. `id="account-overview-title" className="account-overview-title ..."`). List items use the record identifier in the `id` (`played-game-{gameId}`) and the shared base class without it (`played-game`).
- Links open in the current tab by default; do not add `target="_blank"`.
- Use English for code, comments, identifiers, logs, and documentation. When UI text changes, update every translation file (`lib/i18n/translations/{en,vi,ja}.json`) as UTF-8.

## Auth (SSO with the Studio site)

- The access token is kept in memory only (`lib/auth-session.ts`). Never write tokens to `localStorage`.
- The refresh token is an HttpOnly cookie `ss_rt_{APP_ENV}` on `.saigame.studio`, set by the API. Every API call uses `credentials: "include"`.
- On load the app calls `POST /api/v1/auth/refresh` with no body to pick up an existing session from either site.
- Logout must call `POST /api/v1/auth/logout` so the shared cookie is cleared for both sites.
