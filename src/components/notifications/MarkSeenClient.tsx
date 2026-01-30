"use client";

import { useEffect } from "react";

interface MarkSeenClientProps {
  tenantId: string;
}

export default function MarkSeenClient({ tenantId }: MarkSeenClientProps) {
  useEffect(() => {
    if (!tenantId) return;

    const markSeen = async () => {
      try {
        const response = await fetch("/api/notifications/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
        });
        
        if (!response.ok) {
          // Silently fail - don't log errors for expected failures
          return;
        }
      } catch (err) {
        // Silently fail - network errors are expected in some cases
      }
    };

    markSeen();
  }, [tenantId]);

  return null;
}

