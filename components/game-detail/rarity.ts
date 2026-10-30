/** Badge colours per item rarity (same palette as the Studio's player inventory). */
const RARITY_STYLES: Record<string, string> = {
  common: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  uncommon: "border-green-500/40 bg-green-500/15 text-green-400",
  rare: "border-blue-400/40 bg-blue-500/15 text-blue-300",
  epic: "border-purple-400/40 bg-purple-500/15 text-purple-300",
  legendary: "border-yellow-400/40 bg-yellow-500/15 text-yellow-300",
  mythic: "border-rose-400/40 bg-rose-500/15 text-rose-300",
  set_item: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
};

export function rarityStyle(rarity: string | undefined) {
  return (rarity && RARITY_STYLES[rarity.toLowerCase()]) || "border-border bg-muted text-muted-foreground";
}

/** "set_item" -> "set item"; the badge capitalises it. */
export function rarityLabel(rarity: string) {
  return rarity.replace(/_/g, " ");
}
