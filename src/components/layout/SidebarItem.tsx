"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface SidebarItemProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  icon: ReactNode;
  isActive?: boolean;
}

export default function SidebarItem({
  href,
  onClick,
  children,
  icon,
  isActive,
}: SidebarItemProps) {
  const pathname = usePathname();
  const active = isActive ?? (href ? pathname === href || pathname.startsWith(`${href}/`) : false);

  const className = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
    active
      ? "bg-accent-light text-accent"
      : "text-muted hover:bg-[var(--card)] hover:text-[var(--text)]"
  }`;

  const content = (
    <>
      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{icon}</span>
      <span className="flex-1">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`w-full text-left ${className}`}>
      {content}
    </button>
  );
}

