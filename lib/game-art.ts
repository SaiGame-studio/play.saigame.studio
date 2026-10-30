/**
 * Generated stand-in key art for games that have no cover image yet.
 *
 * A deterministic pixel-crystal mosaic (echoing the pixel-art Sai logo) seeded by the game id:
 * the same game always gets the same art, different games get different hues and facets.
 * It encodes nothing about the game itself (no genre, no content).
 */

export interface PixelRun {
  x: number;
  y: number;
  width: number;
  fill: string;
}

export interface GameArt {
  cols: number;
  rows: number;
  /** Darkest shade, used behind the mosaic and for legibility overlays. */
  ground: string;
  runs: PixelRun[];
}

/** Hues sampled around the logo's crystal palette, plus warm counterpoints so games stay distinguishable. */
const HUES = [205, 228, 252, 172, 286, 336, 18, 40];

// Lightness steps of one crystal: shadow, body, mid, face, highlight.
const SHADES = [12, 22, 34, 48, 66];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hue: number, level: number) {
  const saturation = level === 4 ? 70 : 58;
  return `hsl(${hue} ${saturation}% ${SHADES[level]}%)`;
}

/** Builds the mosaic for `seedKey` on a `cols` x `rows` pixel grid. */
export function createGameArt(seedKey: string, cols: number, rows: number): GameArt {
  const random = createRandom(hashString(seedKey));
  const hue = HUES[Math.floor(random() * HUES.length)];
  const secondHue = (hue + (random() < 0.5 ? 24 : -24) + 360) % 360;

  // Facet centres in normalised space, so a banner and a poster of one game share a composition.
  const facetCount = 7 + Math.floor(random() * 4);
  const facets = Array.from({ length: facetCount }, () => ({
    x: random(),
    y: random(),
    level: Math.floor(random() * 4),
    hue: random() < 0.3 ? secondHue : hue,
  }));
  // Light falls from one corner per game.
  const lightX = random() < 0.5 ? -1 : 1;

  const cellOf = (col: number, row: number) => {
    const x = (col + 0.5) / cols;
    const y = (row + 0.5) / rows;
    let best = 0;
    let bestDistance = Infinity;
    facets.forEach((facet, index) => {
      // Stretch the x axis so facets read as tall crystal shards.
      const distance = ((x - facet.x) * 1.6) ** 2 + (y - facet.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  };

  const cells: number[][] = [];
  for (let row = 0; row < rows; row += 1) {
    cells.push(Array.from({ length: cols }, (_, col) => cellOf(col, row)));
  }

  const runs: PixelRun[] = [];
  for (let row = 0; row < rows; row += 1) {
    let current: PixelRun | null = null;
    for (let col = 0; col < cols; col += 1) {
      const cell = cells[row][col];
      const facet = facets[cell];
      const litNeighbour = cells[row][col - lightX] ?? cell;
      const above = row > 0 ? cells[row - 1][col] : cell;
      let level = facet.level;
      const isEdge = above !== cell || litNeighbour !== cell;
      if (isEdge) {
        // Facet edges catch the light, like the bevels on the logo.
        level = Math.min(4, level + 2);
      }
      // A few glints sit on the bevels, never loose in a flat face.
      const sparkle = isEdge && random() < 0.06;
      const fill = sparkle ? "hsl(158 100% 86%)" : shade(facet.hue, level);
      if (current && current.fill === fill) {
        current.width += 1;
      } else {
        current = { x: col, y: row, width: 1, fill };
        runs.push(current);
      }
    }
  }

  return { cols, rows, ground: shade(hue, 0), runs };
}
