"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

export default function NavItem({ href, children, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-accent-light text-accent"
          : "text-muted hover:bg-[var(--card)] hover:text-[var(--text)]"
      }`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}

