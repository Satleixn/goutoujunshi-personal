"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, User, HeartHandshake, Check, Trash2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="font-semibold text-lg text-slate-100">关系档案管理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {editingId ? (
          /* Edit Form */
          <div className="py-4 space-y-3.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">
                编辑：{formData.name || "档案"}
              </span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                取消
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">代号/称呼</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">MBTI 人格</label>
                <select
                  value={formData.mbti || ""}
                  onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm"
                >
                  <option value="">不确定 / 未知</option>
                  {MBTI_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">主观心动/评分 (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score ?? 80}
                  onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm"
                />
              </div>
            </div>

            {formData.role === "target" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">当前关系状态</label>
                <select
                  value={formData.relation || ""}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm"
                >
                  {RELATION_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {formData.role === "self" ? "本人优势与主要顾虑" : "近期关键事件/相处背景"}
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
                placeholder="例如：相识渠道、对方最近表现、经常聊什么、是否有冷淡或热情转变..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-medium py-2 rounded-xl text-sm transition-all"
            >
              保存修改
            </button>
          </div>
        ) : (
          /* Profile List */
          <div className="py-4 space-y-4">
            {/* Self profile */}
            {selfProfile && (
              <div>
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">本人档案</span>
                <div className="mt-1.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      我
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100 text-sm">{selfProfile.name}</span>
                        {selfProfile.mbti && (
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                            {selfProfile.mbti}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {selfProfile.advantages || "未写特质"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartEdit(selfProfile)}
                    className="text-xs text-sky-400 hover:underline px-2 py-1"
                  >
                    编辑
                  </button>
                </div>
              </div>
            )}

            {/* Target profiles */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  咨询对象档案（可切换）
                </span>
                <button
                  type="button"
                  onClick={handleAddNewTarget}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新建对象
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {targetProfiles.map((target) => {
                  const isSelected = activeId === target.id;
                  return (
                    <div
                      key={target.id}
                      onClick={() => handleSelectActive(target.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-sky-950/40 border-sky-500/80 ring-1 ring-sky-500/50"
                          : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-300"
                        }`}>
                          {target.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100 text-sm">{target.name}</span>
                            {target.relation && (
                              <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/40 px-1.5 py-0.5 rounded">
                                {target.relation}
                              </span>
                            )}
                            {target.mbti && (
                              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                {target.mbti}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[190px]">
                            {target.events || "暂无背景事件"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStartEdit(target)}
                          className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                        >
                          编辑
                        </button>
                        {targetProfiles.length > 1 && (
                          <button
                            onClick={() => handleDeleteTarget(target.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
