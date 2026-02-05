/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Zap } from "lucide-react";

interface HeaderProps {
  asLink?: boolean;
}

export function Header({ asLink = false }: HeaderProps) {
  const content = (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-glow to-cyan-glow rounded-lg opacity-80" />
        <div className="absolute inset-[1px] bg-[#030014] rounded-[6px]" />
        <Zap className="w-3.5 h-3.5 text-violet-glow relative z-10" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif] leading-none">
          Video Agent
        </span>
        <span className="text-[8px] font-medium text-muted-foreground tracking-[0.15em] uppercase leading-none mt-0.5">
          DLM Media
        </span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
