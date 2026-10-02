export interface Profile {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  created_at: string;
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  reply_to: string | null;
  created_at: string;
}

// 当前浏览器身份（profile id + username），仅用于记住“我是谁”
export const PROFILE_KEY = "kira-forum:profile";

// 字数限制
export const USERNAME_MAX_LENGTH = 20;
export const POST_TITLE_MAX_LENGTH = 50;
export const POST_BODY_MAX_LENGTH = 1000;
export const COMMENT_MAX_LENGTH = 300;

// 所有时间统一按北京时间（Asia/Shanghai，UTC+8）显示，
// 不受浏览器/服务器本地时区影响。
export function formatTime(timestamp: string | number): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}`;
}

export interface StoredProfile {
  id: string;
  username: string;
}

export function loadProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as StoredProfile).id === "string" &&
      typeof (parsed as StoredProfile).username === "string"
    ) {
      return parsed as StoredProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StoredProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // 忽略写入失败（例如隐私模式 / 存储不可用）
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // 忽略
  }
}
