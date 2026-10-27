import { Building2, CreditCard } from "lucide-react";

export function PaymentMethodIcon({ id, providerKey }: { id: string; providerKey: string }) {
  const Icon = providerKey === "bank_transfer_vn" || providerKey === "direct_transfer" ? Building2 : CreditCard;
  return <Icon id={id} className="size-5" aria-hidden />;
}
