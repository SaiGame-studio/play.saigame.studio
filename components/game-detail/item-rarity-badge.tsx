import { rarityLabel, rarityStyle } from "@/components/game-detail/rarity";
import { cn } from "@/lib/utils";

/** Coloured rarity label for an item; "—" when the item has no rarity. */
export function ItemRarityBadge({ id, rarity }: { id: string; rarity: string | undefined }) {
  if (!rarity) {
    return (
      <span id={id} className="item-rarity-badge text-muted-foreground">
        —
      </span>
    );
  }
  return (
    <span id={id} className={cn("item-rarity-badge inline-flex rounded-sm border px-1.5 py-0.5 text-xs font-semibold capitalize", rarityStyle(rarity))}>
      {rarityLabel(rarity)}
    </span>
  );
}
