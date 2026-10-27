"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readStorage, writeStorage } from "@/lib/safe-storage";
import { sgemApi, type PaymentMethod, type SgemPackage } from "@/lib/sgem-api";

const LAST_PACKAGE_KEY = "sgem:lastPackageId";
const LAST_METHOD_KEY = "sgem:lastMethodId";

export const CHECKOUT_STORAGE_PREFIX = "sgem-checkout:";

type LoadState = "loading" | "error" | "ready";

/** Packages, payment methods, the current selection and checkout for the Buy sGem page. */
export function useSgemShop(locale: string) {
  const router = useRouter();
  const [packages, setPackages] = useState<SgemPackage[]>([]);
  const [packagesState, setPackagesState] = useState<LoadState>("loading");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodsState, setMethodsState] = useState<LoadState>("loading");
  const [selectedPackage, setSelectedPackage] = useState<SgemPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadPackages = useCallback(async () => {
    setPackagesState("loading");
    try {
      const list = await sgemApi.listPackages();
      setPackages(list);
      const saved = readStorage(LAST_PACKAGE_KEY);
      setSelectedPackage(list.find((p) => p.id === saved) ?? list[0] ?? null);
      setPackagesState("ready");
    } catch {
      setPackagesState("error");
    }
  }, []);

  const loadMethods = useCallback(async () => {
    setMethodsState("loading");
    try {
      const list = await sgemApi.listMethods(locale);
      setMethods(list);
      const saved = readStorage(LAST_METHOD_KEY);
      setSelectedMethod(list.find((m) => m.id === saved) ?? null);
      setMethodsState("ready");
    } catch {
      setMethodsState("error");
    }
  }, [locale]);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    void loadMethods();
  }, [loadMethods]);

  const selectPackage = (pkg: SgemPackage) => {
    setSelectedPackage(pkg);
    writeStorage(LAST_PACKAGE_KEY, pkg.id);
  };

  const toggleMethod = (method: PaymentMethod) => {
    const next = selectedMethod?.id === method.id ? null : method;
    setSelectedMethod(next);
    writeStorage(LAST_METHOD_KEY, next?.id ?? null);
  };

  const checkout = async () => {
    if (!selectedPackage || !selectedMethod) {
      return;
    }
    setCheckoutError(null);
    if (selectedMethod.provider_key === "direct_transfer") {
      router.push(`/sgem/direct-transfer?package_id=${selectedPackage.id}`);
      return;
    }
    setIsCheckingOut(true);
    try {
      const res = await sgemApi.purchase(selectedPackage.id, selectedMethod.id);
      const root = res.data ?? res;
      const txId = root.transaction?.id;
      if (!txId) {
        throw new Error("No transaction returned");
      }
      if (selectedMethod.provider_key === "tebex") {
        const checkoutUrl = (root.intent?.checkout_url ?? root.intent?.CheckoutURL) as string | undefined;
        if (!checkoutUrl) {
          throw new Error("Tebex checkout URL was not returned");
        }
        window.location.assign(checkoutUrl);
        return;
      }
      writeStorage(`${CHECKOUT_STORAGE_PREFIX}${txId}`, JSON.stringify(root), "session");
      router.push(`/sgem/checkout?tx_id=${txId}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    packages,
    packagesState,
    reloadPackages: loadPackages,
    methods,
    methodsState,
    reloadMethods: loadMethods,
    selectedPackage,
    selectedMethod,
    selectPackage,
    toggleMethod,
    checkout,
    isCheckingOut,
    checkoutError,
  };
}
