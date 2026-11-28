import { Button } from "@/components/ui/button";

// Planted: the same small, packed buttons as in the admin table, but outside
// the folder the override covers, so ACT-006 is still reported here.
export function Toolbar({ onBold, onItalic }: { onBold: () => void; onItalic: () => void }) {
  return (
    <div className="flex gap-0">
      <Button size="icon" className="size-4" aria-label="Bold" onClick={onBold}>
        B
      </Button>
      <Button size="icon" className="size-4" aria-label="Italic" onClick={onItalic}>
        I
      </Button>
    </div>
  );
}
