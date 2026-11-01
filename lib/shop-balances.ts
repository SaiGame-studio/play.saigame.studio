import { api } from "@/lib/api-client";
import { playerApi, type PlayerContainersPage } from "@/lib/player-api";
import { sgemApi } from "@/lib/sgem-api";
import type { ShopListing } from "@/lib/shop-api";

export function shopCurrencyKey(item: ShopListing): string {
  return item.payment_currency_type === "sgem" ? "sgem" : item.currency?.item_def_id ?? "coins";
}

/** Only main-inventory stacks can pay for inventory-currency purchases. */
async function inventoryBalances(gameId: string, keys: string[]): Promise<Record<string, number>> {
  const page = await api.get<PlayerContainersPage>(
    `/api/v1/games/${encodeURIComponent(gameId)}/containers?type=inventory&limit=1`,
  );
  const container = page.containers?.[0];
  const stacks = container ? (await playerApi.listMyContainerItems(container.id)).items ?? [] : [];
  return Object.fromEntries(keys.map((key) => [
    key,
    stacks.reduce((total, stack) => total + (stack.item_definition_id === key ? stack.quantity : 0), 0),
  ]));
}

export async function loadShopBalances(gameId: string, keys: string[]): Promise<Record<string, number>> {
  const requests: Promise<Record<string, number>>[] = [];
  if (keys.includes("sgem")) requests.push(sgemApi.getWallet().then((wallet) => ({ sgem: wallet.balance })));
  if (keys.includes("coins")) requests.push(api.get<{ balance: number }>("/api/v1/coins/wallet").then((wallet) => ({ coins: wallet.balance })));
  const inventoryKeys = keys.filter((key) => key !== "sgem" && key !== "coins");
  if (inventoryKeys.length) requests.push(inventoryBalances(gameId, inventoryKeys));
  const results = await Promise.allSettled(requests);
  return Object.assign({}, ...results.filter((result) => result.status === "fulfilled").map((result) => result.value));
}
