"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { StatusDefinition } from "@/lib/data/leads";
import { buildLeadQueryString, type LeadQueryParams } from "@/lib/utils/queryParams";

interface LeadTableToolbarProps {
  statuses: StatusDefinition[];
}

export default function LeadTableToolbar({ statuses }: LeadTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentFollowup = searchParams.get("followup") || "";
  const currentSort = searchParams.get("sort") || "updated_desc";

  const [searchValue, setSearchValue] = useState(currentQ);

  const updateParams = (updates: Partial<LeadQueryParams>) => {
    const params: LeadQueryParams = {
      q: updates.q !== undefined ? updates.q : currentQ || undefined,
      status: updates.status !== undefined ? updates.status : currentStatus || undefined,
      followup: updates.followup !== undefined ? updates.followup : (currentFollowup as any) || undefined,
      sort: updates.sort !== undefined ? updates.sort : (currentSort as any) || undefined,
      page: 1,
    };

    const queryString = buildLeadQueryString(params);
    startTransition(() => {
      router.push(queryString || window.location.pathname);
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams({ q: searchValue || undefined });
  };

  const handleReset = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(window.location.pathname);
    });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search leads..."
          className="flex-1 px-4 py-2.5 border border-app bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-muted transition-smooth"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 text-sm font-medium transition-smooth"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        {statuses.length > 0 && (
          <select
            value={currentStatus}
            onChange={(e) => updateParams({ status: e.target.value || undefined })}
            disabled={isPending}
            className="px-3 py-2 border border-app bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-smooth"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={currentFollowup}
          onChange={(e) => updateParams({ followup: (e.target.value || undefined) as any })}
          disabled={isPending}
          className="px-3 py-2 border border-app bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-smooth"
        >
          <option value="">All Follow-ups</option>
          <option value="overdue">Overdue</option>
          <option value="today">Today</option>
          <option value="none">None</option>
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value as any })}
          disabled={isPending}
          className="px-3 py-2 border border-app bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-smooth"
        >
          <option value="updated_desc">Updated (Newest)</option>
          <option value="created_desc">Created (Newest)</option>
          <option value="followup_asc">Follow-up (Earliest)</option>
        </select>

        <button
          onClick={handleReset}
          disabled={isPending}
          className="px-3 py-2 border border-app bg-card rounded-xl text-sm text-muted hover:text-[var(--text)] hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-smooth"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

