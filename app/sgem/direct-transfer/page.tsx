import { Suspense } from "react";
import { SgemDirectTransfer } from "@/components/sgem/sgem-direct-transfer";

export default function SgemDirectTransferPage() {
  return (
    <Suspense>
      <SgemDirectTransfer />
    </Suspense>
  );
}
