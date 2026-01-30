"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Invitation } from "@/lib/data/adminInvites";

interface InviteManagerProps {
  tenantId: string;
  invites: Invitation[];
}

export default function InviteManager({ tenantId, invites }: InviteManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          expiresInDays,
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create invite");

      router.refresh();
      setEmail("");
      setRole("client");
      setExpiresInDays(7);
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Create Invite"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "client")}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 sm:text-sm"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div>
              <span className="font-medium text-gray-900">{invite.email}</span>
              <span className="ml-2 text-sm text-gray-500">({invite.role})</span>
              {invite.used_at ? (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                  Accepted
                </span>
              ) : new Date(invite.expires_at) < new Date() ? (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                  Expired
                </span>
              ) : (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  Pending
                </span>
              )}
            </div>
            {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
              <button
                onClick={() => copyInviteLink(invite.token)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {copiedToken === invite.token ? "Copied!" : "Copy Link"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

