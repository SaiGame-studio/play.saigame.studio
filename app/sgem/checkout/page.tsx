import { Suspense } from "react";
import { SgemCheckout } from "@/components/sgem/sgem-checkout";

export default function SgemCheckoutPage() {
  return (
    <Suspense>
      <SgemCheckout />
    </Suspense>
  );
}
