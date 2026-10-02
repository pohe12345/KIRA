"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "../lib/use-admin";
import { getSupabase } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/supabase/forum";

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, loading, signOut } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("邮箱或密码错误。");
        return;
      }

      const user = data.user;
      if (!user) {
        setError("登录失败，请重试。");
        return;
      }

      const profile = await fetchProfile(user.id);
      if (!profile || !profile.is_admin) {
        await supabase.auth.signOut();
        setError("该账号没有管理员权限。");
        return;
      }

      router.push("/forum");
    } catch {
      setError("登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <div className="mb-8">
        <Link
          href="/forum"
          className="text-sm text-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline"
        >
          [ 返回论坛 ]
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/40">読み込み中……</p>
      ) : isAdmin ? (
        <div className="border border-foreground/30 bg-[#131315] p-6">
          <h1 className="font-serif text-lg tracking-widest">管理员</h1>
          <p className="mt-2 text-sm text-foreground/60">已登录为管理员。</p>
          <div className="mt-5 flex gap-3">
            <Link
              href="/forum"
              className="border border-foreground/40 bg-[#ece6d7] px-4 py-1.5 text-sm text-[#201f1b] transition hover:brightness-110"
            >
              进入论坛
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="border border-foreground/30 px-4 py-1.5 text-sm text-foreground/85 transition hover:bg-foreground/10"
            >
              退出登录
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-foreground/30 bg-[#131315] p-6">
          <h1 className="font-serif text-lg tracking-widest">管理员登录</h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-foreground/70">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                placeholder="邮箱"
                className="w-full border border-foreground/25 bg-black/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-foreground/70">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="密码"
                className="w-full border border-foreground/25 bg-black/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
              />
            </div>

            {error && <p className="text-xs text-foreground/70">{error}</p>}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting || !email.trim() || !password}
                className="border border-foreground/40 bg-[#ece6d7] px-4 py-1.5 text-sm text-[#201f1b] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
              >
                {submitting ? "登录中…" : "登录"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
