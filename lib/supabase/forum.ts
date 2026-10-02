import { getSupabase } from "./client";
import type { Comment, Post } from "@/app/lib/forum";

/** 用户名已被占用（依赖数据库 UNIQUE constraint，错误码 23505） */
export class UsernameTakenError extends Error {
  constructor() {
    super("该用户名已被使用，请换一个用户名。");
    this.name = "UsernameTakenError";
  }
}

/** 把 Supabase / 未知错误格式化为可读字符串（message/code/details/hint），便于排查 */
export function describeSupabaseError(e: unknown): string {
  if (e instanceof UsernameTakenError) return e.message;
  const err = e as {
    message?: string;
    code?: string;
    details?: string | null;
    hint?: string | null;
  };
  const parts: string[] = [];
  if (err.message) parts.push(`message: ${err.message}`);
  if (err.code) parts.push(`code: ${err.code}`);
  if (err.details) parts.push(`details: ${err.details}`);
  if (err.hint) parts.push(`hint: ${err.hint}`);
  return parts.length > 0 ? parts.join(" | ") : "发生错误，请稍后重试。";
}

export interface ProfileRow {
  id: string;
  username: string;
  is_admin: boolean;
}

interface PostRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  profiles?: { username: string } | null;
  comments?: { count: number }[] | null;
}

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  reply_to: string | null;
  created_at: string;
  profiles?: { username: string } | null;
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.profiles?.username ?? "匿名用户",
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    comment_count: row.comments?.[0]?.count ?? 0,
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    username: row.profiles?.username ?? "匿名用户",
    content: row.content,
    reply_to: row.reply_to,
    created_at: row.created_at,
  };
}

// ---------- profiles ----------

export async function createProfile(username: string): Promise<ProfileRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .insert({ username })
    .select("id, username, is_admin")
    .single();

  if (error) {
    if (error.code === "23505") throw new UsernameTakenError();
    throw error;
  }
  return data as ProfileRow;
}

export async function fetchProfile(id: string): Promise<ProfileRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, is_admin")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ProfileRow) ?? null;
}

// ---------- posts ----------

export async function fetchPosts(): Promise<Post[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, title, content, created_at, profiles(username), comments(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as PostRow[]).map(mapPost);
}

export async function fetchPost(id: string): Promise<Post | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, title, content, created_at, profiles(username)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPost(data as unknown as PostRow) : null;
}

export async function createPost(input: {
  user_id: string;
  title: string;
  content: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").insert({
    user_id: input.user_id,
    title: input.title,
    content: input.content,
  });
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ---------- comments ----------

export async function fetchComments(postId: string): Promise<Comment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, content, reply_to, created_at, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as CommentRow[]).map(mapComment);
}

export async function createComment(input: {
  post_id: string;
  user_id: string;
  content: string;
  reply_to: string | null;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("comments").insert({
    post_id: input.post_id,
    user_id: input.user_id,
    content: input.content,
    reply_to: input.reply_to,
  });
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}
