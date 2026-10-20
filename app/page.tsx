"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import QuickPrompts from "@/components/QuickPrompts";
import TargetProfileDrawer from "@/components/TargetProfileDrawer";
import SettingsModal from "@/components/SettingsModal";
import { Send, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Profile, ChatMessage as ChatMessageType } from "@/lib/types";
import {
  getProfiles,
  getActiveTargetId,
  getMessages,
  saveMessages,
  getApiConfig,
} from "@/lib/storage";
import { buildSystemPrompt } from "@/lib/prompt";

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTarget, setActiveTarget] = useState<Profile | undefined>();
  const [selfProfile, setSelfProfile] = useState<Profile | undefined>();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load profiles and message history on mount
  const loadData = () => {
    const list = getProfiles();
    setProfiles(list);
    const self = list.find((p) => p.role === "self");
    setSelfProfile(self);

    const activeId = getActiveTargetId();
    const active = list.find((p) => p.id === activeId) || list.find((p) => p.role === "target");
    setActiveTarget(active);

    const savedMsgs = getMessages();
    if (savedMsgs.length > 0) {
      setMessages(savedMsgs);
    } else {
      // Welcome message
      const welcome: ChatMessageType = {
        id: "welcome",
        role: "assistant",
        content: `你好！我是你的个人恋爱与关系参谋。
无论你现在是心动、暧昧不知所措，还是聊天卡壳、遇到冷淡或冲突，我都在这里。

:::reply-card
### 💡 快速上手建议：
> 直接把对方最新发来的原话粘贴给我，或者在顶部点击【${active?.name || "对象A"}】完善TA的背景。
- **发送时机**：随时需要决策时
- **军师原则**：先接住情绪，绝不盲目打鸡血，给出一键可复制的清醒回复
:::

可以直接点击下方快捷胶囊，或者直接输入你的困惑！`,
        createdAt: Date.now(),
      };
      setMessages([welcome]);
      saveMessages([welcome]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = () => {
    if (confirm("确定要清空当前的聊天记录吗？（对象档案仍会保留）")) {
      setMessages([]);
      saveMessages([]);
      setErrorMsg(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    setInput("");
    setErrorMsg(null);

    const userMsg: ChatMessageType = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
      targetId: activeTarget?.id,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveMessages(newMessages);

    setIsLoading(true);

    // Prepare system prompt with current profiles
    const systemPrompt = buildSystemPrompt(selfProfile, activeTarget);

    // Prepare message array for API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const assistantMsgId = `assistant_${Date.now()}`;
    let assistantText = "";

    // Temporary placeholder for assistant streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        targetId: activeTarget?.id,
      },
    ]);

    try {
      const apiConfig = getApiConfig();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败 (${res.status})`);
      }

      if (!res.body) throw new Error("无数据流返回");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed === "data: [DONE]") {
            break;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || "";
              assistantText += delta;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: assistantText } : m
                )
              );
            } catch {
              // Non-JSON or raw text fallback
            }
          }
        }
      }

      // Final save
      setMessages((prev) => {
        saveMessages(prev);
        return prev;
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "请求异常，请检查 API 配置或网络");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `⚠️ 请求中断：${err.message}\n\n请点击右上角【⚙️ 设置】检查 API Key 或中转地址是否正确。`,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (template: string) => {
    setInput(template);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <Header
        activeTarget={activeTarget}
        onOpenProfiles={() => setIsProfilesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Target Info Ribbon */}
      {activeTarget && (
        <div className="bg-slate-900/60 border-b border-slate-800/50 px-4 py-1.5 text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span>当前参谋对象：</span>
            <span className="text-slate-200 font-medium">{activeTarget.name}</span>
            {activeTarget.relation && (
              <span className="text-[10px] text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-900/50">
                {activeTarget.relation}
              </span>
            )}
            {activeTarget.mbti && (
              <span className="text-[10px] text-slate-300 font-mono">
                {activeTarget.mbti}
              </span>
            )}
          </div>
          <button
            onClick={handleClearChat}
            className="text-slate-500 hover:text-slate-300 p-1 shrink-0 flex items-center gap-1"
            title="清空当前聊天记录"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">清屏</span>
          </button>
        </div>
      )}

      {/* Chat Messages Flow */}
      <main className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>军师正在研判局势并组织话术...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-2 my-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="font-medium">连接提示</p>
              <p className="mt-0.5 text-rose-400">{errorMsg}</p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs bg-rose-900/80 hover:bg-rose-800 text-white px-2.5 py-1 rounded-lg shrink-0"
            >
              去配置
            </button>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* Bottom Area (Quick prompts + Input) */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 safe-bottom">
        {/* Quick Prompts capsules */}
        <QuickPrompts onSelectPrompt={handleSelectPrompt} />

        {/* Input Bar */}
        <div className="p-2.5 flex items-end gap-2">
          <div className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-sky-500/80 focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`跟军师说说，或者粘贴对方的话...`}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-28 leading-relaxed"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Target Drawer Modal */}
      <TargetProfileDrawer
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
        onProfileChanged={() => {
          loadData();
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          setErrorMsg(null);
        }}
      />
    </div>
  );
}
