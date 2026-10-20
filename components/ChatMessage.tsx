"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Sparkles } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Helper to parse content into reply cards vs regular markdown
  const renderContent = (content: string) => {
    // Check for :::reply-card blocks
    const cardRegex = /:::reply-card([\s\S]*?):::/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: "card",
        content: match[1].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (part.type === "card") {
            return (
              <ReplyCard
                key={index}
                rawCard={part.content}
                onCopy={handleCopy}
                isCopied={copiedText !== null}
              />
            );
          }
          return (
            <div key={index} className="text-sm">
              <ReactMarkdown
                components={{
                  strong: ({ children }) => (
                    <strong className="font-bold text-amber-300/95">{children}</strong>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-sky-300 mt-2.5 mb-1.5">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-sky-300 mt-2 mb-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-slate-100 mt-1.5 mb-1">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-1.5 leading-relaxed text-slate-100">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-4 my-1.5 space-y-1 text-slate-200">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-4 my-1.5 space-y-1 text-slate-200">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-2 p-2.5 rounded-lg bg-sky-950/40 border-l-4 border-sky-500 text-sky-100 text-sm">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-amber-300">
                      {children}
                    </code>
                  ),
                }}
              >
                {part.content}
              </ReactMarkdown>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex gap-2.5 my-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-md overflow-hidden ${
          isUser
            ? "bg-gradient-to-tr from-sky-500 to-blue-600 text-white"
            : "border border-amber-500/40 bg-slate-900"
        }`}
      >
        {isUser ? (
          "我"
        ) : (
          <img src="/icon.png" alt="军师" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[86%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-sky-600 text-white rounded-tr-none"
            : "bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-none"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : (
          renderContent(message.content)
        )}
      </div>
    </div>
  );
}

// Sub-component for Reply Card
function ReplyCard({
  rawCard,
  onCopy,
  isCopied,
}: {
  rawCard: string;
  onCopy: (text: string) => void;
  isCopied: boolean;
}) {
  // Extract blockquote text
  const quoteMatch = rawCard.match(/>\s*(.+)/);
  const replyText = quoteMatch ? quoteMatch[1].trim() : rawCard;

  return (
    <div className="my-2.5 p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-1.5 text-amber-400 font-medium text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>建议直接发送成文</span>
        </div>
        <button
          onClick={() => onCopy(replyText)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
            isCopied
              ? "bg-emerald-500 text-white"
              : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 active:scale-95"
          }`}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              一键复制
            </>
          )}
        </button>
      </div>

      {/* The reply text */}
      <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-slate-100 font-medium text-sm leading-relaxed select-all">
        {replyText}
      </div>

      {/* Extra card details like timing/reason */}
      <div className="mt-2 text-xs text-slate-400 space-y-1">
        {rawCard
          .split("\n")
          .filter((line) => !line.startsWith(">") && !line.startsWith("###") && line.trim())
          .map((line, idx) => (
            <p key={idx} className="leading-snug">
              {line.replace(/^-\s*/, "")}
            </p>
          ))}
      </div>
    </div>
  );
}
