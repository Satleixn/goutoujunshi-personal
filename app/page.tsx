"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import QuickPrompts from "@/components/QuickPrompts";
import TargetProfileDrawer from "@/components/TargetProfileDrawer";
import SettingsModal from "@/components/SettingsModal";
import LockScreen from "@/components/LockScreen";
import { Send, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Profile, ChatMessage as ChatMessageType } from "@/lib/types";
import {
  getProfiles,
  getActiveTargetId,
  getMessages,
  saveMessages,
  getApiConfig,
  getSavedAccessCode,
  clearAccessCode,
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

  // Authentication & Lock Screen States
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentAccessCode, setCurrentAccessCode] = useState("");

  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check auth requirement and load profiles & messages
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json().catch(() => ({}));

        if (data.requiresAuth) {
          setRequiresAuth(true);
          const savedCode = getSavedAccessCode();
          if (savedCode) {
            // Verify cached access code
            const verifyRes = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessCode: savedCode }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyData.success) {
              setCurrentAccessCode(savedCode);
              setIsAuthenticated(true);
            } else {
              clearAccessCode();
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setRequiresAuth(false);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Failed to check auth status", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
    loadData();
  }, []);

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
        content: `私人关系参谋卷宗已就绪。当前关联对象为 **${active?.name || "对象A"}**，所有对话与档案均保存在本地设备。

:::reply-card
### 快速使用说明
> 直接把对方刚发来的原话粘贴到下方，或在顶部点击对象名称补充背景。
- **分析流程**：情绪落地 · 事实与推测拆分 · 局势研判 · 成品话术与后续分支
- **参谋原则**：站在你的长期选择权与情绪稳定一边，不打鸡血，只给可执行方案
:::

可点选下方场景标签快速填入模板，或直接输入当前处境。`,
        createdAt: Date.now(),
      };
      setMessages([welcome]);
      saveMessages([welcome]);
    }
  };

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

  const handleLockDevice = () => {
    clearAccessCode();
    setCurrentAccessCode("");
    setIsAuthenticated(false);
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 40), 220);
    textarea.style.height = `${nextHeight}px`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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
          accessCode: currentAccessCode,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          clearAccessCode();
          setIsAuthenticated(false);
          throw new Error("访问密码错误或已失效，请重新输入访问密码解锁");
        }
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
                content: `请求中断：${err.message}\n\n请检查配置或重新验证访问密码。`,
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
    setTimeout(() => {
      adjustTextareaHeight();
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const match = template.match(/【(.*?)】/);
        if (match && match.index !== undefined) {
          const start = match.index;
          const end = match.index + match[0].length;
          textarea.setSelectionRange(start, end);
        } else {
          textarea.setSelectionRange(template.length, template.length);
        }
      }
    }, 50);
  };

  // If server requires ACCESS_CODE and user is not authenticated yet
  if (!isCheckingAuth && requiresAuth && !isAuthenticated) {
    return (
      <LockScreen
        onSuccess={(code) => {
          setCurrentAccessCode(code);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-page text-ink-primary overflow-hidden">
      {/* Top Header */}
      <Header
        activeTarget={activeTarget}
        onOpenProfiles={() => setIsProfilesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Signature Dossier Meta Ribbon (36px) */}
      {activeTarget && (
        <div className="h-9 bg-surface-deep border-b border-hairline px-4 text-xs flex items-center justify-between text-ink-muted font-mono tabular-nums shrink-0">
          <div className="flex items-center gap-3 truncate">
            <span>
              卷宗 <strong className="font-normal text-ink-secondary">{activeTarget.name}</strong>
            </span>
            {activeTarget.relation && (
              <>
                <span className="text-ink-muted/50">·</span>
                <span className="text-ink-secondary">{activeTarget.relation}</span>
              </>
            )}
            {activeTarget.mbti && (
              <>
                <span className="text-ink-muted/50">·</span>
                <span className="text-ink-secondary">{activeTarget.mbti}</span>
              </>
            )}
            {activeTarget.score !== undefined && (
              <>
                <span className="text-ink-muted/50">·</span>
                <span className="text-accent">{activeTarget.score} / 100</span>
              </>
            )}
          </div>
          <button
            onClick={handleClearChat}
            type="button"
            className="text-ink-muted hover:text-ink-primary px-2 py-1 rounded-md shrink-0 flex items-center gap-1.5 transition-colors duration-150 ease-unslop"
            title="清空当前聊天记录"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-xs font-sans">清屏</span>
          </button>
        </div>
      )}

      {/* Chat Messages Flow */}
      <main className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-ink-muted text-xs px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" strokeWidth={1.5} />
              <span>正在拆解局势与拟定话术</span>
            </div>
          )}

          {errorMsg && (
            <div className="my-3 p-3.5 rounded-xl bg-surface-card border border-negative/40 flex items-start gap-3 text-xs text-ink-primary">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-negative" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="font-medium text-ink-primary">连接异常</p>
                <p className="mt-0.5 text-ink-secondary">{errorMsg}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="h-7 px-2.5 rounded-md bg-surface-raised hover:bg-surface-deep border border-hairline text-ink-primary shrink-0 transition-colors duration-150 ease-unslop"
              >
                检查配置
              </button>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>

      {/* Bottom Area (Quick prompts + Input) */}
      <footer className="bg-surface-page/95 backdrop-blur-md border-t border-hairline safe-bottom shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Quick Prompts */}
          <QuickPrompts onSelectPrompt={handleSelectPrompt} />

          {/* Input Bar */}
          <div className="px-4 pb-3 pt-1 flex items-end gap-2">
            <div className="flex-1 bg-surface-deep border border-hairline rounded-lg px-3 py-2 focus-within:border-hairline-strong transition-colors duration-150 ease-unslop">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="粘贴对方原话，或描述当前处境"
                className="w-full bg-transparent text-ink-primary placeholder-ink-muted text-sm focus:outline-none resize-none leading-relaxed overflow-y-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`h-10 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-[background-color,color,transform,opacity] duration-150 ease-unslop shrink-0 ${
                input.trim() && !isLoading
                  ? "bg-ink-primary text-surface-deep active:scale-[0.97]"
                  : "bg-surface-card text-ink-muted border border-hairline cursor-not-allowed"
              }`}
            >
              <span>发送</span>
              <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
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
        onLockDevice={handleLockDevice}
      />
    </div>
  );
}
