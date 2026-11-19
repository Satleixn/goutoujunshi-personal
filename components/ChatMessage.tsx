"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
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
    }, 1800);
  };

  // Parse content into reply cards vs regular markdown
  const renderContent = (content: string) => {
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
                    <strong className="font-medium text-ink-primary">{children}</strong>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-medium text-ink-primary mt-3 mb-1.5">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-medium text-ink-primary mt-2.5 mb-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-ink-primary mt-2 mb-1">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-1.5 leading-relaxed text-ink-secondary">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-4 my-1.5 space-y-1 text-ink-secondary">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-4 my-1.5 space-y-1 text-ink-secondary">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-2 p-3 rounded-lg bg-surface-deep border-l-2 border-accent text-ink-primary text-sm">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-surface-deep border border-hairline font-mono text-xs text-ink-primary">
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

  if (isUser) {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-[85%] sm:max-w-[78%] rounded-xl px-4 py-3 bg-surface-raised border border-hairline text-ink-primary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 my-4 items-start">
      {/* Advisor Mark */}
      <div className="w-7 h-7 rounded-lg shrink-0 mt-0.5 overflow-hidden border border-hairline bg-surface-card">
        <img src="/icon.png" alt="军师" className="w-full h-full object-cover" />
      </div>

      {/* Advisor Content */}
      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[84%] rounded-xl px-4 py-3 bg-surface-card/60 border border-hairline text-ink-primary">
        {renderContent(message.content)}
      </div>
    </div>
  );
}

// THE MOMENT: Crafted Reply Dossier Card (Outer radius 12px, padding 12px/16px, inner radius 8px)
function ReplyCard({
  rawCard,
  onCopy,
  isCopied,
}: {
  rawCard: string;
  onCopy: (text: string) => void;
  isCopied: boolean;
}) {
  const quoteMatch = rawCard.match(/>\s*(.+)/);
  const replyText = quoteMatch ? quoteMatch[1].trim() : rawCard;

  return (
    <div className="my-3 p-3.5 rounded-xl bg-surface-card border border-hairline-strong border-l-2 border-l-accent shadow-top-highlight">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-xs font-medium text-accent">
            建议成文 · 首选方案
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(replyText)}
          className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-[background-color,color,transform] duration-150 ease-unslop active:scale-[0.97] ${
            isCopied
              ? "bg-positive text-surface-deep border-transparent"
              : "bg-surface-raised text-ink-primary border-hairline hover:border-hairline-strong"
          }`}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-ink-secondary" strokeWidth={1.5} />
              <span>复制话术</span>
            </>
          )}
        </button>
      </div>

      {/* Reply text box (inner radius = 8px) */}
      <div className="p-3 bg-surface-deep rounded-lg border border-hairline text-ink-primary text-sm leading-relaxed select-all">
        {replyText}
      </div>

      {/* Extra card details like timing/reason */}
      <div className="mt-2.5 text-xs text-ink-muted space-y-1">
        {rawCard
          .split("\n")
          .filter((line) => !line.startsWith(">") && !line.startsWith("###") && line.trim())
          .map((line, idx) => (
            <p key={idx} className="leading-relaxed">
              {line.replace(/^-\s*/, "")}
            </p>
          ))}
      </div>
    </div>
  );
}
