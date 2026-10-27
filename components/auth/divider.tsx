export function OrDivider({ id, label }: { id: string; label: string }) {
  return (
    <div id={id} className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
      <span id={`${id}-left`} className="h-px flex-1 bg-border" />
      <span id={`${id}-label`}>{label}</span>
      <span id={`${id}-right`} className="h-px flex-1 bg-border" />
    </div>
  );
}
