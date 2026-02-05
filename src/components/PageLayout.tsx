"use client";

import { Header } from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  showLogoAsLink?: boolean;
}

export function PageLayout({
  children,
  rightContent,
  showLogoAsLink = false,
}: PageLayoutProps) {
  return (
    <div className="h-screen w-screen bg-background flex flex-col bg-grid">
      <header className="flex justify-between items-center py-4 px-6 shrink-0 border-b border-violet-glow/5">
        <Header asLink={showLogoAsLink} />
        {rightContent}
      </header>
      {children}
    </div>
  );
}
