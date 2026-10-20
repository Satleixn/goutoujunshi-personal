"use client";

import React from "react";
import { QuickPrompt } from "@/lib/types";

interface QuickPromptsProps {
  onSelectPrompt: (template: string) => void;
}

const PRESET_PROMPTS: QuickPrompt[] = [
  {
    id: "reply",
    label: "💬 帮我回这句",
    template: "对方发来：【粘贴对方的话】。我想表达：【想法】。请先帮我稳住情绪，给出一条能直接发送的首选成品话术，并说明时机和后续分支。",
  },
  {
    id: "signals",
    label: "🔍 分析对方态度",
    template: "对方最近的表现是：【简述近几次互动或回复频率】。请帮我拆分已知事实与推测，判断对方的真实态度与意愿。",
  },
  {
    id: "date",
    label: "☕ 约会/见面设计",
    template: "我想找个合适的机会约对方出来，请帮我设计一个具体、低压力、可退出的邀约方案与开场白。",
  },
  {
    id: "cold",
    label: "🧊 冷淡/投入失衡",
    template: "我感觉最近互动明显失衡，对方回复冷淡或敷衍。帮我判断是临时状况还是关系降级，我该如何调整节奏或设置停止条件？",
  },
  {
    id: "conflict",
    label: "⚡ 发生冲突/修复",
    template: "刚刚我们产生了摩擦/说错话，具体情况是：【简述】。请教我如何不讨好、有边界地化解冲突并表达真实感受？",
  },
  {
    id: "exit",
    label: "🚪 体面退出/断联",
    template: "我觉得这段关系消耗很大且没有互惠，决定停止投入/退出。请帮我写一段体面、坚定且不撕破脸的收尾表达。",
  },
];

export default function QuickPrompts({ onSelectPrompt }: QuickPromptsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1.5 px-3 flex gap-2">
      {PRESET_PROMPTS.map((prompt) => (
        <button
          key={prompt.id}
          type="button"
          onClick={() => onSelectPrompt(prompt.template)}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
}
