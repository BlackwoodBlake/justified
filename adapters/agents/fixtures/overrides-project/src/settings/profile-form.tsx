import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Planted: the person's own email with no autoComplete (FRM-007, overridden
// but out of date), and a button that just says "Submit" (ACT-001a, a guideline here).
export function ProfileForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <Input id="email" name="email" type="email" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
