---
name: Sai Play
description: Player portal of Sai Game, presented as a game publisher's home.
colors:
  night-navy: "hsl(233 42% 7%)"
  console-card: "hsl(233 36% 11%)"
  muted-slate: "hsl(232 30% 16%)"
  hairline: "hsl(232 28% 20%)"
  frost-text: "hsl(214 45% 95%)"
  mist-text: "hsl(224 22% 70%)"
  crystal-azure: "hsl(205 78% 62%)"
  ink-on-azure: "hsl(233 48% 9%)"
  mint-glint: "hsl(158 100% 86%)"
  logo-indigo: "hsl(234 52% 48%)"
  alarm-red: "hsl(352 88% 64%)"
typography:
  display:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 800
    lineHeight: 0.88
  headline:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
  title:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 0.95
  stat:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
spacing:
  gutter: "16px"
  card-gap: "16px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.crystal-azure}"
    textColor: "{colors.ink-on-azure}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-large:
    backgroundColor: "{colors.crystal-azure}"
    textColor: "{colors.ink-on-azure}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.console-card}"
    textColor: "{colors.frost-text}"
    rounded: "{rounded.md}"
    height: "44px"
  game-poster:
    backgroundColor: "{colors.console-card}"
    rounded: "{rounded.md}"
    padding: "16px"
  badge-banned:
    backgroundColor: "{colors.alarm-red}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: Sai Play

## Overview

**Creative North Star: "The Crystal Publisher"**

Sai Play is the category-standard game publisher portal, played straight: the home page is a poster wall of the player's game library. Its colour and material come from the pixel-art crystal "S" logo: a night-navy ground taken from the logo's outline, crystal azure for action, logo indigo for large brand fields, and mint for the glints on the logo's bevels.

Every game is shown with key art: the image set in the Studio's Game Public Info, or otherwise a generated pixel-crystal mosaic seeded by the game id (`lib/game-art.ts`, `components/games/game-cover-art.tsx`), so each game keeps one identity wherever it appears. Type is a heavy condensed display set in uppercase for anything a publisher would put on a box or banner, with a humanist sans for reading text. Corners are tight, borders are hairlines, and depth comes from art plus a bottom-up shade, not glow.

**Key Characteristics:**
- Dark night-navy ground, chosen for players at home in the evening, matching the logo's outline.
- Key art first: posters carry the game's art edge to edge.
- Condensed uppercase display type for titles, buttons and navigation.
- Level numbers in mint; all other numbers in frost white, tabular.
- Tight radii (2-4px), 1px hairlines, a single 3px azure bar for "active".

## Colors

A cold, logo-derived palette: navy surfaces, one azure action colour, mint and indigo as the logo's secondary voices.

### Primary
- **Crystal Azure**: the action colour. Primary buttons, the active navigation bar, focus rings, text selection tint.

### Secondary
- **Logo Indigo**: large brand fields, such as the account avatar tile. Never used for text.
- **Mint Glint**: level values and the glints in generated key art. A highlight, never a surface.

### Neutral
- **Night Navy**: page ground and the shade at the foot of key art.
- **Console Card**: card, panel, dialog and poster backgrounds.
- **Muted Slate**: hover fills, skeletons, scrollbar thumb.
- **Hairline**: every border and divider.
- **Frost Text**: primary text and stat values.
- **Mist Text**: secondary text, stat labels, dates.
- **Alarm Red**: destructive actions and the Banned badge.

### Named Rules
**The One Azure Rule.** Crystal azure marks what you can act on or where you are; it is not decoration.
**The Mint Is Progress Rule.** Mint belongs to level values (and the art's glints). Other numbers stay frost white.

## Typography

**Display Font:** Barlow Condensed (via `next/font`, latin + vietnamese, 500-800)
**Body Font:** Be Vietnam Pro (via `next/font`, latin + vietnamese, 400-600)

**Character:** A tall, compressed poster face for the publisher voice over a clear Vietnamese-first humanist sans for reading. Japanese text falls back to the system face.

### Hierarchy
- **Display** (800, 3rem mobile to 3.75rem desktop, 0.9): the empty-library title, uppercase.
- **Headline** (800, 2.25-3rem, 1): page titles ("Your games", "Buy sGem", sign-in titles), uppercase.
- **Title** (700, 1.5rem, 0.95): poster titles, uppercase, two-line clamp.
- **Stat** (700, 1.5-2.25rem, 1, tabular): level and XP values.
- **Body** (400, 0.875-1rem, 1.5): descriptions, dates, form text.
- **Label** (500, 0.6875-0.75rem, 0.14em, uppercase): stat labels such as LEVEL and XP, placed under their value.

### Named Rules
**The Box-Art Rule.** Game names, page titles, buttons and navigation are condensed uppercase; reading text never is.
**The Value-First Rule.** A stat shows its value first and its label underneath.

## Layout

Content sits in a centred 72rem (1152px) container with 16px side gutters. Key art breaks out of the container and runs full-bleed; text on art stays aligned to the container. The poster grid is 2 columns on phones, 3 from 640px, 4 from 1024px, with 12-16px gaps. Sections open with the heading on a hairline rule, 48-64px below the previous section.

## Elevation & Depth

Flat, tonal layering. Depth comes from key art under a bottom-up navy shade (and a left-side shade on desktop) that keeps text legible. Shadows are limited to two cases with an offset and soft blur: the primary button (`0 6px 18px -8px` azure at 60%) and floating panels (dialogs, menus, the sign-in card).

### Named Rules
**The No-Halo Rule.** No zero-offset coloured glows; light lives in the art.

## Shapes

Tight, near-square corners: 2px for badges, 4px for buttons, cards, panels and dialogs. 1px hairline borders. The active state is a 3px azure bar under navigation items. Generated art is pixel-grid, rendered with crisp edges; the logo is rendered pixelated.

## Components

### Buttons
- **Shape:** gently squared (4px).
- **Primary:** crystal azure fill, navy ink, condensed uppercase label with 0.06em tracking; 44px tall (48px large size).
- **Hover / Focus:** brightness lift on hover, 1px press on active, 2px azure focus ring offset from the navy ground.
- **Outline:** console-card fill with a faint frost border; border and text turn azure on hover.

### Game Poster
- **Shape:** 3:4 portrait, 4px corners, hairline border.
- **Content:** the game's image from the Studio's Game Public Info (`image_url`), or generated key art when none is set or it fails to load; bottom-up shade; the game name only (2-line clamp).

### Navigation
- Solid navy header, 64px, hairline bottom border.
- Items are condensed uppercase with an icon; the active item carries a 3px azure bar at the header's bottom edge, which scales in on hover. Phones show icons only.
- A "My games" switcher sits right of Home: same nav-item styling, opens a searchable listbox (thumbnail + name) under the header; arrow keys, Enter and Escape work; picking a game opens `/games/[gameId]`.

### Tabs
- Page tabs (game page): condensed uppercase labels on a hairline with the 3px azure bar under the selected tab; selection kept in the URL.
- Secondary view toggle (Items / Containers): a segmented control on a card ground, selected segment filled crystal azure.

### Item Lists
- Items table: hairline-divided rows on the night-navy ground, rarity as a small coloured badge, quantities tabular, levels in mint.
- Container grid: the container's cells as dark squares, items placed at their grid position spanning their size, tinted by rarity with initials and quantity.

## Do's and Don'ts

### Do:
- **Do** give every game key art: its `image_url`, falling back to `GameCoverArt` seeded by the game id.
- **Do** keep sGem on the shared `SgemIcon`.
- **Do** keep numbers tabular, with level values in mint.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading.
- **Don't** add zero-offset glows, glass blur or gradient text.
- **Don't** show catalog, news or promotional content the API does not provide.
