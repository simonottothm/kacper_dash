"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tenant } from "@/lib/data/adminTenants";
import TenantCreateDialog from "./TenantCreateDialog";

interface TenantListProps {
  tenants: Tenant[];
}

export default function TenantList({ tenants }: TenantListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex justify-between items-center w-full">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Tenants</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent text-sm font-medium transition-smooth"
        >
          Create Tenant
        </button>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No tenants yet</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/admin/tenants/${tenant.id}`}
              className="block p-6 bg-card border border-app rounded-2xl shadow-app hover:border-accent hover:shadow-app-md transition-smooth"
            >
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{tenant.name}</h3>
              <p className="text-sm text-muted">
                Created {new Date(tenant.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      <TenantCreateDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

