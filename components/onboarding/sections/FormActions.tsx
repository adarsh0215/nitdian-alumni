"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function FormActions({
  onSkip,
  submitting,
  canSubmit,
}: {
  onSkip: () => void;
  submitting: boolean;
  canSubmit: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onSkip} disabled={submitting}>
        Skip for now
      </Button>
      <Button type="submit" disabled={!canSubmit}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          "Finish"
        )}
      </Button>
    </div>
  );
}
