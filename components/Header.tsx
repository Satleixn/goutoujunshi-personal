"use client";

import React from "react";
import { Settings, ChevronDown } from "lucide-react";
import { Profile } from "@/lib/types";

interface HeaderProps {
  activeTarget?: Profile;
  onOpenProfiles: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  activeTarget,
  onOpenProfiles,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 bg-surface-page/95 backdrop-blur-md border-b border-hairline px-4 safe-top flex items-center justify-between shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-hairline bg-surface-raised flex items-center justify-center">
          <img src="/icon.png" alt="狗头军师" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-medium text-sm text-ink-primary leading-none">
            狗头军师
          </h1>
          <p className="text-xs text-ink-muted mt-1 leading-none">
            私人关系参谋
          </p>
        </div>
      </div>

      {/* Target Selector & Settings */}
      <div className="flex items-center gap-2">
        {/* Active Target Button */}
        <button
          onClick={onOpenProfiles}
          type="button"
          className="h-8 px-3 rounded-lg bg-surface-card hover:bg-surface-raised border border-hairline flex items-center gap-2 text-xs text-ink-primary transition-[background-color,border-color,transform] duration-150 ease-unslop active:scale-[0.97]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <span className="font-medium max-w-[88px] truncate">
            {activeTarget ? activeTarget.name : "选择对象"}
          </span>
          {activeTarget?.score !== undefined && (
            <span className="text-xs text-ink-muted font-mono tabular-nums">
              {activeTarget.score}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          type="button"
          aria-label="设置"
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-raised border border-hairline flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-[background-color,color,transform] duration-150 ease-unslop active:scale-[0.97]"
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
