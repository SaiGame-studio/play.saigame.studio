import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormAlertProps {
  id: string;
  tone: "error" | "success";
  message: string;
}

export function FormAlert({ id, tone, message }: FormAlertProps) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      id={id}
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-primary/40 bg-primary/10 text-primary",
      )}
    >
      <Icon id={`${id}-icon`} className="mt-0.5 size-4 shrink-0" />
      <span id={`${id}-text`}>{message}</span>
    </div>
  );
}
