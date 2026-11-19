"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Profile } from "@/lib/types";
import { getProfiles, saveProfiles, getActiveTargetId, setActiveTargetId } from "@/lib/storage";

interface TargetProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged: () => void;
}

const MBTI_OPTIONS = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const RELATION_OPTIONS = [
  "刚认识", "暗恋/心动", "暧昧中", "约会中",
  "恋爱中", "冷淡期/疏远", "发生冲突", "分手断联", "考虑复合",
];

export default function TargetProfileDrawer({ isOpen, onClose, onProfileChanged }: TargetProfileDrawerProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (isOpen) {
      const list = getProfiles();
      setProfiles(list);
      setActiveId(getActiveTargetId());
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectActive = (id: string) => {
    setActiveId(id);
    setActiveTargetId(id);
    onProfileChanged();
  };

  const handleStartEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setFormData({ ...profile });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = profiles.map((p) => {
      if (p.id === editingId) {
        return {
          ...p,
          ...formData,
          updatedAt: Date.now(),
        } as Profile;
      }
      return p;
    });
    setProfiles(updated);
    saveProfiles(updated);
    setEditingId(null);
    onProfileChanged();
  };

  const handleAddNewTarget = () => {
    const nextNumber = profiles.filter((p) => p.role === "target").length + 1;
    const newProfile: Profile = {
      id: `target_${Date.now()}`,
      name: `对象${String.fromCharCode(64 + nextNumber)}`,
      role: "target",
      mbti: "INFP",
      score: 80,
      relation: "暧昧中",
      events: "近期关键进展...",
      updatedAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    handleSelectActive(newProfile.id);
    handleStartEdit(newProfile);
  };

  const handleDeleteTarget = (id: string) => {
    if (id === "self") return;
    if (confirm("确定要删除这个对象档案吗？")) {
      const updated = profiles.filter((p) => p.id !== id);
      setProfiles(updated);
      saveProfiles(updated);
      if (activeId === id) {
        const nextActive = updated.find((p) => p.role === "target")?.id || null;
        setActiveId(nextActive);
        setActiveTargetId(nextActive);
      }
      onProfileChanged();
    }
  };

  const selfProfile = profiles.find((p) => p.role === "self");
  const targetProfiles = profiles.filter((p) => p.role === "target");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-surface-page border border-hairline-strong rounded-t-2xl sm:rounded-2xl p-5 shadow-top-highlight flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <h2 className="font-medium text-base text-ink-primary">关系档案卷宗</h2>
            <p className="text-xs text-ink-muted mt-0.5">全部档案仅保存在本地浏览器，不上传云端</p>
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

        {editingId ? (
          /* Edit Form */
          <div className="py-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink-primary">
                编辑卷宗 · {formData.name || "档案"}
              </span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-ink-muted hover:text-ink-primary transition-colors duration-150 ease-unslop"
              >
                返回列表
              </button>
            </div>

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">代号与称呼</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-ink-secondary mb-1.5">MBTI 类型</label>
                <select
                  value={formData.mbti || ""}
                  onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                  className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary text-sm focus:outline-none"
                >
                  <option value="">不确定 / 未知</option>
                  {MBTI_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-secondary mb-1.5">主观心动评估 (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score ?? 80}
                  onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                  className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary text-sm font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>

            {formData.role === "target" && (
              <div>
                <label className="block text-xs text-ink-secondary mb-1.5">当前关系阶段</label>
                <select
                  value={formData.relation || ""}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full h-10 bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg px-3 text-ink-primary text-sm focus:outline-none"
                >
                  {RELATION_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">
                {formData.role === "self" ? "本人特质与主要顾虑" : "近期关键事件与互动背景"}
              </label>
              <textarea
                rows={3}
                value={(formData.role === "self" ? formData.advantages : formData.events) || ""}
                onChange={(e) => {
                  if (formData.role === "self") {
                    setFormData({ ...formData, advantages: e.target.value });
                  } else {
                    setFormData({ ...formData, events: e.target.value });
                  }
                }}
                placeholder="例如：相识渠道、最近聊天频率、有无约会或摩擦事件"
                className="w-full bg-surface-deep border border-hairline focus:border-hairline-strong rounded-lg p-3 text-ink-primary placeholder-ink-muted text-sm focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className="w-full h-10 bg-ink-primary text-surface-deep font-medium rounded-lg text-xs transition-transform duration-150 ease-unslop active:scale-[0.98]"
            >
              保存卷宗
            </button>
          </div>
        ) : (
          /* Profile List */
          <div className="py-4 space-y-5">
            {/* Self profile */}
            {selfProfile && (
              <div>
                <span className="text-xs text-ink-muted">本人档案</span>
                <div className="mt-2 p-3 rounded-xl bg-surface-card border border-hairline flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-hairline text-ink-secondary flex items-center justify-center font-medium text-xs shrink-0">
                      我
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-primary text-sm">{selfProfile.name}</span>
                        {selfProfile.mbti && (
                          <span className="text-xs bg-surface-deep text-ink-secondary px-1.5 py-0.5 rounded font-mono tabular-nums border border-hairline">
                            {selfProfile.mbti}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted truncate mt-0.5">
                        {selfProfile.advantages || "未填写特质与顾虑"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selfProfile)}
                    className="h-7 px-2.5 rounded-md text-xs text-ink-secondary hover:text-ink-primary bg-surface-raised border border-hairline shrink-0 transition-colors duration-150 ease-unslop"
                  >
                    编辑
                  </button>
                </div>
              </div>
            )}

            {/* Target profiles */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  咨询对象卷宗（点击切换当前对象）
                </span>
                <button
                  type="button"
                  onClick={handleAddNewTarget}
                  className="flex items-center gap-1 text-xs text-accent hover:opacity-80 font-medium transition-opacity duration-150 ease-unslop"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>新建对象</span>
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {targetProfiles.map((target) => {
                  const isSelected = activeId === target.id;
                  return (
                    <div
                      key={target.id}
                      onClick={() => handleSelectActive(target.id)}
                      className={`p-3 rounded-xl border transition-[background-color,border-color] duration-150 ease-unslop cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-surface-raised border-accent shadow-top-highlight"
                          : "bg-surface-card border-hairline hover:border-hairline-strong"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-xs shrink-0 border ${
                            isSelected
                              ? "bg-surface-deep text-accent border-accent/40"
                              : "bg-surface-deep text-ink-secondary border-hairline"
                          }`}
                        >
                          {target.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-ink-primary text-sm">{target.name}</span>
                            {target.relation && (
                              <span className="text-xs text-ink-secondary bg-surface-deep px-1.5 py-0.5 rounded border border-hairline">
                                {target.relation}
                              </span>
                            )}
                            {target.mbti && (
                              <span className="text-xs bg-surface-deep text-ink-muted px-1.5 py-0.5 rounded font-mono tabular-nums border border-hairline">
                                {target.mbti}
                              </span>
                            )}
                            {target.score !== undefined && (
                              <span className="text-xs font-mono tabular-nums text-accent">
                                {target.score}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-muted truncate mt-0.5">
                            {target.events || "暂无背景事件"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(target)}
                          className="h-7 px-2.5 rounded-md text-xs text-ink-secondary hover:text-ink-primary bg-surface-deep border border-hairline transition-colors duration-150 ease-unslop"
                        >
                          编辑
                        </button>
                        {targetProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTarget(target.id)}
                            aria-label="删除档案"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-negative transition-colors duration-150 ease-unslop"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
