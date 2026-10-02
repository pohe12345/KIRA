"use client";

import { useEffect, useState } from "react";
import ForumHeader from "../components/forum/forum-header";
import PostItem from "../components/forum/post-item";
import CreatePostModal from "../components/forum/create-post-modal";
import UsernameSetupModal from "../components/forum/username-modal";
import { useCurrentProfile } from "../lib/use-profile";
import { useAdmin } from "../lib/use-admin";
import {
  type Post,
  POST_TITLE_MAX_LENGTH,
  POST_BODY_MAX_LENGTH,
} from "../lib/forum";
import {
  createPost,
  createProfile,
  deletePost,
  describeSupabaseError,
  fetchPosts,
  UsernameTakenError,
} from "@/lib/supabase/forum";
import { SupabaseConfigError } from "@/lib/supabase/client";

export default function ForumPage() {
  const { profile, loaded, completeProfile } = useCurrentProfile();
  const { isAdmin } = useAdmin();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    fetchPosts()
      .then(setPosts)
      .catch(() => setLoadError("无法加载帖子，请检查 Supabase 配置。"));
  }, [loaded]);

  const needsUsername = loaded && profile === null;

  async function handleSetUsername(name: string): Promise<string | null> {
    try {
      const row = await createProfile(name);
      completeProfile({ id: row.id, username: row.username, isAdmin: row.is_admin });
      return null;
    } catch (e) {
      console.error("[createProfile] 失败：", e);
      if (e instanceof UsernameTakenError) return e.message;
      if (e instanceof SupabaseConfigError) return e.message;
      return describeSupabaseError(e);
    }
  }

  async function handleCreatePost(
    title: string,
    body: string,
  ): Promise<string | null> {
    const t = title.trim();
    const b = body.trim();
    if (t.length === 0 && b.length === 0) return "标题或正文不能为空。";
    if (t.length > POST_TITLE_MAX_LENGTH || b.length > POST_BODY_MAX_LENGTH) {
      return "内容超出长度限制。";
    }
    if (!profile) return "请先设置用户名。";
    try {
      await createPost({ user_id: profile.id, title: t, content: b });
      const refreshed = await fetchPosts();
      setPosts(refreshed);
      setCreateOpen(false);
      return null;
    } catch (e) {
      console.error("[createPost] 失败：", e);
      return describeSupabaseError(e);
    }
  }

  async function handleDeletePost(postId: string) {
    if (!window.confirm("确定要删除这个帖子吗？")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      console.error("[deletePost] 失败：", e);
      window.alert("删除失败：没有权限或发生错误。");
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
        <ForumHeader
          username={profile?.username ?? ""}
          onCreatePost={() => setCreateOpen(true)}
        />

        <section className="mt-10">
          {!loaded ? (
            <p className="text-sm text-foreground/40">読み込み中……</p>
          ) : loadError ? (
            <p className="text-sm text-foreground/60">{loadError}</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-foreground/60">まだ投稿がありません。</p>
          ) : (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                isAdmin={isAdmin}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </section>

        {createOpen && (
          <CreatePostModal
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </main>

      {needsUsername && <UsernameSetupModal onSave={handleSetUsername} />}
    </>
  );
}
