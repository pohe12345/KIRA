"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/supabase/forum";

/**
 * 管理员状态（基于 Supabase Auth）：
 * - 监听 Auth session 变化
 * - 用 auth.uid() 查 public.profiles，判断 is_admin 是否为 true
 * - 提供 isAdmin / loading / signOut
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      // Supabase 未配置
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;
      if (!userId) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      fetchProfile(userId)
        .then((profile) => {
          if (!cancelled) setIsAdmin(!!profile && profile.is_admin);
        })
        .catch(() => {
          if (!cancelled) setIsAdmin(false);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {
      // 忽略登出失败
    }
    setIsAdmin(false);
  }, []);

  return { isAdmin, loading, signOut };
}
