"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ApiKey } from "@/lib/data/apiKeys";

interface ApiKeyManagerProps {
  tenantId: string;
  keys: ApiKey[];
}

export default function ApiKeyManager({ tenantId, keys: initialKeys }: ApiKeyManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<{ apiKey: ApiKey; plaintextKey: string } | null>(null);
  const [keys, setKeys] = useState(initialKeys);

  if (keys !== initialKeys) {
    setKeys(initialKeys);
  }

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create API key");

      setNewKey({
        apiKey: data.data.apiKey,
        plaintextKey: data.data.plaintextKey,
      });
      router.refresh();
      setName("");
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (keyId: string, currentActive: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/api-keys/${keyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentActive }),
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to update API key");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Create API Key"}
        </button>
      </div>

      {newKey && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            API Key Created - Save this key now!
          </h3>
          <div className="mb-3">
            <label className="block text-xs font-medium text-yellow-700 mb-1">
              API Key (shown only once)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded text-sm font-mono break-all">
                {newKey.plaintextKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey.plaintextKey);
                }}
                className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Copy
              </button>
            </div>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="text-sm text-yellow-700 hover:text-yellow-800"
          >
            I&apos;ve saved the key
          </button>
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Make.com Integration"
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
        {keys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys yet</p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
            >
              <div>
                <h3 className="font-medium text-gray-900">{key.name}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(key.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Last used: {formatDate(key.last_used_at)}
                </p>
                {!key.is_active && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <button
                onClick={() => handleToggleActive(key.id, key.is_active)}
                className={`px-3 py-1 text-sm border rounded-xl ${key.is_active
                    ? "border-red-300 text-red-600 hover:bg-red-50"
                    : "border-green-300 text-green-600 hover:bg-green-50"
                  }`}
              >
                {key.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

