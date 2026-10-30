---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/app-header.tsx","app/globals.css"]
---

# Surface: Home — Your games (`app/page.tsx`) and the shared shell

Scope: the site shell (header, footer, tokens) and the Home route. Mode: persuade (publisher portal home), signed-in players only.
Audience/job: a Sai Game player checks the games they have played with this account and their progress, and tops up sGem.
Content: only the player's real played games (name, level, XP, last played, banned) and links that already exist (Buy sGem, Account, Sai Server). No catalog, news, play links or promotions.
Constraints: AGENTS.md rules (ids/classes, SgemIcon, useConfirm, same-tab links, i18n en/vi/ja).

## Direction contract
THESIS: The category-standard publisher portal, played straight: a full-bleed key-art banner for the player's most recently played game, a rotator across recent games, then a poster grid of every game. Refuses an admin-style list of stat cards.
OWN-WORLD: Ground is the logo's navy outline; the logo's crystal azure is the action colour, its indigo owns large fields (sGem band), mint is the highlight for level numbers. Display is a heavy condensed sans, uppercase for titles; body stays Be Vietnam Pro. Key art is generated pixel-crystal mosaics seeded by game id, echoing the pixel-art logo. Small radii, hairline borders, no glow halos.
STORY: The player sees their latest game huge, understands their level and XP at a glance, browses the rest of their library, and can top up sGem from the band below.
FIRST VIEWPORT: Header (logo, Home, Buy sGem, wallet, language, user). Below it a 21:9-ish banner, key art full-bleed, game title in condensed display at bottom-left, Level / XP / last played meta row, Buy sGem as primary action, thumbnail selector of up to five recent games at bottom-right.
FORM: Category canon (standing exit chosen by the owner), position: canon. seed:f6d39a61263aa7e0
Signature interaction: banner rotator with thumbnail selector, cross-fade of key art and title, auto-advance paused on hover/focus and off under reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
