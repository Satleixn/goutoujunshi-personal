"use client";

import React from "react";
import { Settings, Users, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 safe-top flex items-center justify-between shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
          🐶
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm text-slate-100 leading-tight">狗头军师</h1>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded border border-slate-700 font-mono">
              个人版
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            恋爱局势看清 · 话术即抄即发
          </p>
        </div>
      </div>

      {/* Target Selector & Settings */}
      <div className="flex items-center gap-2">
        {/* Active Target Button */}
        <button
          onClick={onOpenProfiles}
          type="button"
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-full pl-2.5 pr-2 py-1 text-xs text-slate-200 transition-all active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="font-medium max-w-[80px] truncate">
            {activeTarget ? activeTarget.name : "选择对象"}
          </span>
          {activeTarget?.score !== undefined && (
            <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 px-1 rounded">
              {activeTarget.score}分
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          type="button"
          aria-label="设置"
          className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
