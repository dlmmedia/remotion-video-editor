"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap,
  Play,
  FolderOpen,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  transparent?: boolean;
  showProjectNav?: boolean;
}

export function Navbar({ transparent = false, showProjectNav = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  const navBg =
    transparent && !scrolled
      ? "bg-transparent"
      : "bg-[#030014]/80 backdrop-blur-xl border-b border-violet-glow/10";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        navBg,
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-glow to-cyan-glow rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[1px] bg-[#030014] rounded-[7px]" />
              <Zap className="w-4 h-4 text-violet-glow relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif] leading-none">
                Video Agent
              </span>
              <span className="text-[9px] font-medium text-muted-foreground tracking-[0.2em] uppercase leading-none mt-0.5">
                by DLM Media
              </span>
            </div>
          </Link>

          {/* Center nav links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="Studio" icon={<Sparkles className="w-3.5 h-3.5" />} active />
            <NavLink href="/generate" label="Generate" icon={<Play className="w-3.5 h-3.5" />} />
            <NavLink href="/code-examples" label="Examples" icon={<FolderOpen className="w-3.5 h-3.5" />} />
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <Link
              href="/generate"
              className="relative group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-glow to-cyan-glow opacity-90 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">New Project</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#030014]/95 backdrop-blur-xl border-t border-violet-glow/10 px-6 py-4 space-y-2 animate-slide-down">
          <MobileNavLink href="/" label="Studio" />
          <MobileNavLink href="/generate" label="Generate" />
          <MobileNavLink href="/code-examples" label="Examples" />
          <div className="pt-2 border-t border-border">
            <Link
              href="/generate"
              className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-violet-glow to-cyan-glow text-white text-sm font-semibold"
            >
              New Project
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        active
          ? "text-foreground bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
    </Link>
  );
}
