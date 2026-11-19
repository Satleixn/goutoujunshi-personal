"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
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
      setErrorMsg("请输入访问口令");
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
        throw new Error(data.error || "访问口令未通过校验");
      }

      if (remember) {
        saveAccessCode(cleanCode);
      }

      onSuccess(cleanCode);
    } catch (err: any) {
      setErrorMsg(err.message || "口令校验失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page text-ink-primary">
      <div className="w-full max-w-sm bg-surface-card border border-hairline-strong rounded-2xl p-6 shadow-top-highlight space-y-5">
        {/* Dossier Header Meta */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline text-xs font-mono tabular-nums text-ink-muted">
          <span>PRIVATE DOSSIER</span>
          <span className="flex items-center gap-1.5 text-accent">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>LOCKED</span>
          </span>
        </div>

        {/* Brand & Description */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-hairline bg-surface-raised shrink-0">
            <img src="/icon.png" alt="狗头军师" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-medium text-ink-primary">
              狗头军师 · 私人卷宗
            </h1>
            <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
              站点已开启访问保护，请输入预设口令解锁
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="输入访问口令"
                className={`w-full h-10 bg-surface-deep border rounded-lg pl-3 pr-10 text-ink-primary placeholder-ink-muted focus:outline-none text-sm transition-colors duration-150 ease-unslop ${
                  errorMsg
                    ? "border-negative"
                    : "border-hairline focus:border-hairline-strong"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary p-0.5"
              >
                {showCode ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-negative text-xs mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-ink-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded bg-surface-deep border-hairline accent-accent w-3.5 h-3.5"
            />
            <span>在此设备记住口令</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg font-medium text-xs bg-ink-primary text-surface-deep transition-transform duration-150 ease-unslop active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                <span>正在校验</span>
              </>
            ) : (
              <span>解锁卷宗</span>
            )}
          </button>
        </form>

        <p className="text-xs text-ink-muted pt-1 border-t border-hairline leading-relaxed">
          口令对应部署环境变量中的 <code className="font-mono text-ink-secondary">ACCESS_CODE</code>
        </p>
      </div>
    </div>
  );
}
