"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Trash2, Check, ShieldCheck, Lock } from "lucide-react";
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
    }, 500);
  };

  const handleClear = () => {
    if (confirm("确定要清空手机本地保存的所有档案、聊天记录和密钥吗？操作后不可恢复。")) {
      clearAllLocalData();
      alert("本地所有数据已清空。");
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-surface-page border border-hairline-strong rounded-t-2xl sm:rounded-2xl p-5 shadow-top-highlight flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <h2 className="font-medium text-base text-ink-primary">接口与隐私设置</h2>
            <p className="text-xs text-ink-muted mt-0.5">配置自定义模型密钥或管理本地缓存</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-card transition-colors duration-150 ease-unslop"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm">
          {/* Privacy Note */}
          <div className="bg-surface-card border border-hairline rounded-xl p-3 flex gap-2.5 items-start text-xs text-ink-secondary">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-accent" strokeWidth={1.5} />
            <p className="leading-relaxed">
              您的 API Key 与所有关系档案仅保存在本地浏览器缓存中，不会上传至任何第三方服务器。
            </p>
          </div>

          {/* Lock status and action */}
          {hasSavedCode && onLockDevice && (
            <div className="bg-surface-card border border-hairline rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-ink-secondary">
                <Lock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span>此设备已记住访问口令</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLockDevice();
                }}
                className="h-7 px-2.5 rounded-md text-xs bg-surface-raised hover:bg-surface-deep text-ink-primary border border-hairline transition-colors duration-150 ease-unslop"
              >
                立即锁定
              </button>
            </div>
          )}

          {/* Base URL */}
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">
              API 基础端点 (Base URL)
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.deepseek.com"
              className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary placeholder-ink-muted focus:outline-none text-sm font-mono"
            />
            <p className="text-xs text-ink-muted mt-1">
              默认官方地址。若使用聚合中转平台可填写对应 URL
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">
              DeepSeek API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg pl-3 pr-10 text-ink-primary placeholder-ink-muted focus:outline-none text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                {showKey ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              若服务端已配置 DEEPSEEK_API_KEY 环境变量，此处可留空
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">
              模型名称 (Model)
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="deepseek-flash"
              className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary placeholder-ink-muted focus:outline-none text-sm font-mono"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="h-10 px-3 rounded-lg flex items-center gap-1.5 text-xs text-negative hover:bg-surface-card transition-colors duration-150 ease-unslop"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            <span>清空本地数据</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`flex-1 sm:flex-initial h-10 px-5 rounded-lg flex items-center justify-center gap-1.5 font-medium text-xs transition-[background-color,color,transform] duration-150 ease-unslop active:scale-[0.98] ${
              savedSuccess
                ? "bg-positive text-surface-deep"
                : "bg-ink-primary text-surface-deep"
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" strokeWidth={1.8} />
                <span>已保存</span>
              </>
            ) : (
              <span>保存配置</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
