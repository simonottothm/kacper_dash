"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface UserMenuProps {
  userEmail: string;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isSettingsActive = pathname === "/app/settings";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent font-medium text-xs">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-[var(--text)] truncate text-sm">{userEmail}</div>
        </div>
      </div>

      <Link
        href="/app/settings"
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
          isSettingsActive
            ? "bg-accent-light text-accent"
            : "text-muted hover:bg-[var(--card)] hover:text-[var(--text)]"
        }`}
      >
        <Cog6ToothIcon className="w-5 h-5" />
        <span>Settings</span>
      </Link>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:bg-[var(--card)] hover:text-[var(--text)] transition-colors text-left"
      >
        <span>Logout</span>
      </button>
    </div>
  );
}

