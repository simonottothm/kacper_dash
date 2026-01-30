"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import BackButton from "./BackButton";
import Badges from "@/components/notifications/Badges";

interface TopbarProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  tenantId?: string;
  onMenuClick?: () => void;
}

export default function Topbar({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  tenantId,
  onMenuClick,
}: TopbarProps) {
  return (
    <div className="h-16 bg-card border-b border-app flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted hover:text-[var(--text)] transition-colors -ml-2"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {backHref && <BackButton href={backHref} label={backLabel} />}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text)] truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {tenantId && <Badges tenantId={tenantId} />}
        {actions}
      </div>
    </div>
  );
}
