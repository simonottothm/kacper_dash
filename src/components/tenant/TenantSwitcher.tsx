"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TenantSwitcherProps {
  memberships: Array<{
    tenant_id: string;
    tenant: {
      id: string;
      name: string;
    };
  }>;
  activeTenantId: string;
}

export default function TenantSwitcher({
  memberships,
  activeTenantId,
}: TenantSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (memberships.length <= 1) {
    return null;
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTenantId = e.target.value;
    if (newTenantId === activeTenantId) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/tenant/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId: newTenantId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch tenant");
      }

      router.refresh();
    } catch (error) {
      console.error("Error switching tenant:", error);
      alert("Failed to switch tenant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label htmlFor="tenant-select" className="block text-xs font-medium text-muted mb-2">
        Active Tenant
      </label>
      <select
        id="tenant-select"
        value={activeTenantId}
        onChange={handleChange}
        disabled={loading}
        className="block w-full px-3 py-2.5 text-sm border border-app bg-card rounded-xl shadow-app focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
      >
        {memberships.map((membership) => (
          <option key={membership.tenant_id} value={membership.tenant_id}>
            {membership.tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}

