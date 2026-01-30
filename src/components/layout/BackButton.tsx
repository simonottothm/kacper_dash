"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-muted hover:text-[var(--text)] transition-colors"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

