import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  action?: ReactNode;
  children: ReactNode;
}

/** Label + control pair; `id` must match the control's id. */
export function Field({ id, label, action, children }: FieldProps) {
  return (
    <div id={`${id}-field`} className="space-y-2">
      <div id={`${id}-label-row`} className="flex items-center justify-between">
        <label id={`${id}-label`} htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}
