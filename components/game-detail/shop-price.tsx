import { SgemIcon } from "@/components/sgem/sgem-icon";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { ShopListing } from "@/lib/shop-api";
import { cn } from "@/lib/utils";

/** An amount in the item's payment currency: sGem (with its icon), an in-game item, or coins. */
export function ShopPrice({ id, item, amount, className }: { id: string; item: ShopListing; amount: number; className?: string }) {
  const { t, locale } = useTranslation();
  const value = amount.toLocaleString(locale);

  if (item.payment_currency_type === "sgem") {
    return (
      <span id={id} className={cn("shop-price inline-flex items-center gap-1 tabular", className)}>
        <SgemIcon id={`${id}-sgem-icon`} />
        <span id={`${id}-value`} className="shop-price-value">{value}</span>
      </span>
    );
  }
  return (
    <span id={id} className={cn("shop-price inline-flex items-center gap-1 tabular", className)}>
      <span id={`${id}-value`} className="shop-price-value">{value}</span>
      <span id={`${id}-currency`} className="shop-price-currency text-muted-foreground">{item.currency?.item_name ?? t("shops.coins")}</span>
    </span>
  );
}
