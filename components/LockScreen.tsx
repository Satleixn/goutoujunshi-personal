"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { saveAccessCode } from "@/lib/storage";

interface LockScreenProps {
  onSuccess: (code: string) => void;
}

export default function LockScreen({ onSuccess }: LockScreenProps) {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg("请输入访问密码");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: cleanCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || "访问密码错误，请重新输入");
      }

      if (remember) {
        saveAccessCode(cleanCode);
      }

      onSuccess(cleanCode);
    } catch (err: any) {
      setErrorMsg(err.message || "密码校验失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 3D App Icon */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-500/40 relative mb-4">
          <img src="/icon.png" alt="狗头军师" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 bg-slate-950/80 p-1 rounded-tl-lg">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
          狗头军师
          <span className="text-xs bg-amber-950/60 text-amber-300 border border-amber-800/50 px-1.5 py-0.5 rounded font-mono">
            专属受控
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 mb-6 max-w-[240px] leading-relaxed">
          此站点已启用个人密码保护，请输入您在 Vercel 配置的访问密码
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative text-left">
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="输入访问密码..."
                className={`w-full bg-slate-800/90 border rounded-2xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 text-sm transition-all ${
                  errorMsg
                    ? "border-rose-500/80 focus:ring-rose-500"
                    : "border-slate-700/80 focus:ring-sky-500"
                }`}
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none justify-start px-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-sky-500/20 w-4 h-4"
            />
            <span>记住这台设备（后续打开免重复输入）</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl font-medium text-sm text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                验证中...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                验证并进入
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-6 leading-relaxed">
          密码为您在 Vercel 环境变量中设置的 <code className="text-slate-400">ACCESS_CODE</code>
        </p>
      </div>
    </div>
  );
}
