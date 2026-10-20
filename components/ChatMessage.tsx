"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Clock, Compass } from "lucide-react";
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
            <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm">
              {formatMarkdownText(part.content, handleCopy, copiedText)}
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
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold shadow-md ${
          isUser
            ? "bg-gradient-to-tr from-sky-500 to-blue-600 text-white"
            : "bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950"
        }`}
      >
        {isUser ? "我" : "🐶"}
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

// Basic markdown format helper
function formatMarkdownText(
  text: string,
  onCopy: (t: string) => void,
  copiedText: string | null
) {
  // If text contains blockquotes, give them copy buttons too
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("> ")) {
      const quoteText = line.replace(/^>\s*/, "");
      const isThisCopied = copiedText === quoteText;
      return (
        <div
          key={i}
          className="my-1.5 p-2.5 rounded-lg bg-sky-950/30 border-l-4 border-sky-500 flex items-center justify-between text-sky-100 text-sm"
        >
          <span>{quoteText}</span>
          <button
            onClick={() => onCopy(quoteText)}
            className="p-1 text-slate-400 hover:text-sky-300 shrink-0 ml-2"
            title="复制这句"
          >
            {isThisCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="font-semibold text-slate-100 text-sm mt-2 mb-1">
          {line.replace(/^###\s*/, "")}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="font-bold text-slate-100 text-base mt-2.5 mb-1.5 text-sky-300">
          {line.replace(/^##\s*/, "")}
        </h2>
      );
    }
    return <span key={i}>{line + (i < lines.length - 1 ? "\n" : "")}</span>;
  });
}
