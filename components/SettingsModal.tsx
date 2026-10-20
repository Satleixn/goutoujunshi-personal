"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Save, Trash2, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { ApiConfig } from "@/lib/types";
import { getApiConfig, saveApiConfig, clearAllLocalData, getSavedAccessCode } from "@/lib/storage";
import { DEFAULT_MODEL } from "@/lib/prompt";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
  onLockDevice?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onConfigSaved,
  onLockDevice,
}: SettingsModalProps) {
  const [config, setConfig] = useState<ApiConfig>({
    baseUrl: "https://api.deepseek.com",
    apiKey: "",
    model: DEFAULT_MODEL,
  });
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasSavedCode, setHasSavedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getApiConfig());
      setSavedSuccess(false);
      setHasSavedCode(Boolean(getSavedAccessCode()));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onConfigSaved?.();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (confirm("确定要清空手机本地保存的所有档案、聊天记录和密钥吗？操作后不可恢复。")) {
      clearAllLocalData();
      alert("本地所有数据已清空。");
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="font-semibold text-lg text-slate-100">API 与个人配置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm">
          {/* Note */}
          <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3 flex gap-2.5 items-start text-xs text-sky-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
            <p>
              隐私保护提示：您的 API Key 与所有恋爱档案仅加密缓存在手机本地浏览器中，绝不上报给任何开发者服务器。
            </p>
          </div>

          {/* Lock status and action */}
          {hasSavedCode && onLockDevice && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>此设备已记住访问密码</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLockDevice();
                }}
                className="text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg font-medium transition-all"
              >
                立即锁定设备
              </button>
            </div>
          )}

          {/* Base URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              API 基础端点 (Base URL)
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.deepseek.com"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              默认官方地址。使用第三方中转聚合平台可直接填其提供的 URL。
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              DeepSeek API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              若在 Vercel 环境变量中配置了 DEEPSEEK_API_KEY，此处可留空直接使用。
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              模型型号 (Model)
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="deepseek-flash"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空本地数据
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 text-sm transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存配置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
