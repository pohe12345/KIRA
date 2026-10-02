import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** 环境变量未配置时抛出，便于前端区分「配置问题」和「数据库问题」 */
export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase 未配置：请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
    this.name = "SupabaseConfigError";
  }
}

/**
 * 浏览器端 Supabase 客户端（使用 publishable/anon key，不暴露 secret key）。
 * 懒加载：只在真正调用时创建，避免 SSR/构建阶段因缺少环境变量而报错。
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new SupabaseConfigError();
  }

  client = createClient(url, key);
  return client;
}
