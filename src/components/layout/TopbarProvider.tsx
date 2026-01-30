"use client";

import { createContext, useContext, ReactNode } from "react";

interface TopbarConfig {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  tenantId?: string;
}

const TopbarContext = createContext<TopbarConfig | null>(null);

export function TopbarProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: TopbarConfig | null;
}) {
  return <TopbarContext.Provider value={config}>{children}</TopbarContext.Provider>;
}

export function useTopbar() {
  return useContext(TopbarContext);
}

