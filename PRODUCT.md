# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Players of Sai Game titles who hold a Sai Game account (the same account used on the Studio site, Sai Server). They come to Sai Play to see the games they have played with that account, their progress in each, and to buy sGem.

## Product Purpose
Sai Play (play.saigame.studio) is the player-facing portal of Sai Game. It shows the signed-in player's own games and progress, their account details, and their sGem wallet, and lets them buy sGem. It should feel like the home of a game publisher, not an admin console.

## Positioning
One Sai Game account across Sai Game titles: the portal is the player's personal record of the games they have played with it (level, XP, last played, ban status), plus their sGem wallet.

## Operating Context
- Signed-in only: an SSO session shared with Sai Server via the `ss_rt_{APP_ENV}` HttpOnly cookie; guests see login, register and forgot-password.
- Routes: `/` (Your games), `/account`, `/sgem` (buy sGem: packages, payment methods, order summary), `/sgem/checkout`, `/sgem/direct-transfer`, `/login`, `/register`, `/forgot-password`.
- Languages: English, Vietnamese, Japanese (`lib/i18n/translations/{en,vi,ja}.json`).

## Capabilities and Constraints
- Player API (`GET /api/v1/player/me/games`) returns only: `game_id`, `game_name`, `level`, `experience`, `is_banned`, `first_played_at`, `last_played_at`, cursor-paginated (20 per page).
- No game catalog, news, featured games, cover images, genres or play links exist in the API. Do not invent these concepts or their data.
- Next.js 16 app router, React 19, Tailwind 3, lucide-react icons.
- Repository rules in `AGENTS.md` are binding: feature-scoped kebab-case `id` + matching class on every element, sGem always shown with `<SgemIcon />`, confirmations only via `useConfirm()`, links open in the same tab, `.tsx` files ≤700 lines, UI text in all three translation files.

## Brand Commitments
- Name: "Sai Play"; the Studio site is "Sai Server"; the company is Sai Game.
- Logo: `public/logo.png`.
- sGem: blue diamond icon `public/icons/sgem.svg` via `components/sgem/sgem-icon.tsx`, never replaced.
- Visual direction requested by the owner: a game publisher's site. In the first direction round the owner chose the category-standard publisher portal, played straight (benchmark: Garena, VNG-level publisher portals): key-art hero for a game plus a grid of game cards.

## Evidence on Hand
- Real data: only the signed-in player's played games (fields above), account profile, sGem wallet balance, sGem packages and payment methods.
- No key art or cover images per game yet. Generated cover art keyed to the game's id/name is acceptable as a stand-in until real art exists; it must not imply genre, content or claims about the game.

## Product Principles
1. Show only what is true for this player; never pad the page with fabricated catalog, news or promotions.
2. The player's games are the hero: progress (level, XP, last played) is the content.
3. One account, many games: the shell (header, wallet, account) stays consistent across every page.
4. Publisher-grade presentation on a small, honest data set.
