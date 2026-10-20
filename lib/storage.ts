import { Profile, ChatMessage, ApiConfig } from "./types";
import { DEFAULT_BASE_URL, DEFAULT_MODEL } from "./prompt";

const PROFILES_KEY = "goutoujunshi_profiles";
const ACTIVE_TARGET_KEY = "goutoujunshi_active_target_id";
const MESSAGES_KEY = "goutoujunshi_messages";
const API_CONFIG_KEY = "goutoujunshi_api_config";

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "self",
    name: "我",
    role: "self",
    mbti: "INFP",
    score: 80,
    advantages: "真诚、善解人意、共情力强",
    disadvantages: "容易内耗、有时犹豫不决",
    updatedAt: Date.now(),
  },
  {
    id: "target_1",
    name: "对象A",
    role: "target",
    mbti: "INTJ",
    score: 85,
    relation: "暧昧中",
    events: "认识两个月，最近每周见一次，微信回复有时较慢但见面时互动良好",
    updatedAt: Date.now(),
  },
];

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return DEFAULT_PROFILES;
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: Profile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to save profiles to localStorage", err);
  }
}

export function getActiveTargetId(): string | null {
  if (typeof window === "undefined") return "target_1";
  try {
    return localStorage.getItem(ACTIVE_TARGET_KEY) || "target_1";
  } catch {
    return "target_1";
  }
}

export function setActiveTargetId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TARGET_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TARGET_KEY);
    }
  } catch (err) {
    console.error("Failed to set active target", err);
  }
}

export function getMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep last 100 messages to prevent quota exceeded
    const trimmed = messages.slice(-100);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save messages", err);
  }
}

export function getApiConfig(): ApiConfig {
  const fallback: ApiConfig = {
    baseUrl: DEFAULT_BASE_URL,
    apiKey: "",
    model: DEFAULT_MODEL,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(API_CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      baseUrl: parsed.baseUrl?.trim() || DEFAULT_BASE_URL,
      apiKey: parsed.apiKey?.trim() || "",
      model: parsed.model?.trim() || DEFAULT_MODEL,
    };
  } catch {
    return fallback;
  }
}

export function saveApiConfig(config: ApiConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save api config", err);
  }
}

export function clearAllLocalData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(ACTIVE_TARGET_KEY);
  localStorage.removeItem(MESSAGES_KEY);
  localStorage.removeItem(API_CONFIG_KEY);
}
