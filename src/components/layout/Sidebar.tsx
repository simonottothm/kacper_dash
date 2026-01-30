"use client";

import Link from "next/link";
import {
  HomeIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import SidebarItem from "./SidebarItem";
import TenantSwitcher from "@/components/tenant/TenantSwitcher";
import type { Membership } from "@/lib/data/tenants";

interface SidebarProps {
  userEmail: string;
  memberships: Membership[];
  activeTenantId: string | null;
  isAdmin: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  userEmail,
  memberships,
  activeTenantId,
  isAdmin,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <div
      className={`fixed lg:sticky lg:top-0 left-0 top-0 h-screen w-[280px] shrink-0 bg-card border-r border-app flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo with Close Button (Mobile) */}
      <div className="px-6 py-5 border-b border-app flex items-center justify-between shrink-0">
        <Link href="/app" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-app-md">
            <span className="text-white font-bold text-base">K</span>
          </div>
          <span className="font-bold text-xl text-[var(--text)]">Kasper</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-muted hover:text-[var(--text)] transition-colors"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <nav className="space-y-1">
          <SidebarItem href="/app" icon={<HomeIcon className="w-5 h-5" />} onClick={onClose}>
            Dashboard
          </SidebarItem>

          {isAdmin && (
            <SidebarItem href="/admin" icon={<ShieldCheckIcon className="w-5 h-5" />} onClick={onClose}>
              Admin
            </SidebarItem>
          )}
        </nav>

        {/* Tenant Switcher */}
        {activeTenantId && memberships.length > 0 && (
          <div className="mt-6 pt-6 border-t border-app">
            <TenantSwitcher memberships={memberships} activeTenantId={activeTenantId} />
          </div>
        )}
      </div>

      {/* Bottom Section: Profile & Actions */}
      <div className="px-4 py-4 border-t border-app space-y-1 shrink-0">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent font-medium text-xs shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text)] truncate">{userEmail}</div>
          </div>
        </div>

        {/* Settings */}
        <SidebarItem href="/app/settings" icon={<Cog6ToothIcon className="w-5 h-5" />} onClick={onClose}>
          Settings
        </SidebarItem>

        {/* Logout */}
        <SidebarItem
          onClick={async () => {
            const { createClient } = await import("@/lib/supabase/browser");
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
        >
          Logout
        </SidebarItem>
      </div>
    </div>
  );
}
