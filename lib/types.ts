export interface Profile {
  id: string;
  name: string;
  role: "self" | "target";
  mbti?: string;
  score?: number; // 0-100
  relation?: string;
  advantages?: string;
  disadvantages?: string;
  events?: string;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  targetId?: string;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  icon?: string;
  template: string;
}
