import { Button } from "@/components/ui/button";

// Planted: icon buttons smaller than 24 px, packed together (ACT-006, overridden here).
export function RowActions({ onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex gap-0">
      <Button size="icon" className="size-4" aria-label="Edit user" onClick={onEdit}>
        E
      </Button>
      <Button size="icon" className="size-4" aria-label="Remove user" onClick={onRemove}>
        R
      </Button>
    </div>
  );
}
