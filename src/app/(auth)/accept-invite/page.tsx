"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const redirectUrl = `/login?redirect=/accept-invite?token=${token}`;
        router.replace(redirectUrl);
        return;
      }
      setChecking(false);
    };

    if (token) {
      checkAuth();
    } else {
      setError("Invalid invite link");
      setChecking(false);
    }
  }, [token, router]);

  const handleAccept = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to accept invite");
      }

      router.push(data.data.redirectTo || "/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-4">This invite link is invalid or missing a token.</p>
          <a
            href="/login"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Accept Invitation</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to accept this invitation and join the tenant.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Accepting..." : "Accept Invitation"}
        </button>
      </div>
    </div>
  );
}

