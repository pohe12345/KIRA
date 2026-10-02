"use client";

import { useCallback, useEffect, useState } from "react";
import { clearProfile, loadProfile, saveProfile, type Profile } from "./forum";
import { fetchProfile } from "@/lib/supabase/forum";

/**
 * 当前用户身份：
 * - localStorage 记住 { id, username }（稳定身份，暂不接 Supabase Auth）
 * - 每次进入时从数据库读取 is_admin（管理员身份由数据库决定，不信任本地）
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const stored = loadProfile();
    if (!stored) {
      setLoaded(true);
      return;
    }

    // 先用本地身份乐观渲染，isAdmin 暂为 false
    setProfile({ id: stored.id, username: stored.username, isAdmin: false });

    fetchProfile(stored.id)
      .then((row) => {
        if (cancelled) return;
        if (row) {
          setProfile({ id: row.id, username: row.username, isAdmin: row.is_admin });
        } else {
          // 数据库中不存在该 profile（例如数据库被重置），清除本地身份
          clearProfile();
          setProfile(null);
        }
      })
      .catch(() => {
        // 网络错误：保留本地身份（isAdmin=false），避免误判为未设置
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeProfile = useCallback((p: Profile) => {
    saveProfile({ id: p.id, username: p.username });
    setProfile(p);
  }, []);

  return { profile, loaded, completeProfile };
}
