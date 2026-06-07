"use client";

import { useEffect } from "react";

interface Props {
  entityType: "employee" | "product" | "ad";
  entityId: string;
}

export default function ClickTracker({ entityType, entityId }: Props) {
  useEffect(() => {
    // Fire and forget — don't block page render
    fetch(`/api/track/${entityType}/${entityId}`, { method: "POST" }).catch(
      () => {}
    );
  }, [entityType, entityId]);

  return null;
}
