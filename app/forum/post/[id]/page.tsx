"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import UsernameSetupModal from "../../../components/forum/username-modal";
import { useCurrentProfile } from "../../../lib/use-profile";
import { useAdmin } from "../../../lib/use-admin";
import {
  type Comment,
  type Post,
  COMMENT_MAX_LENGTH,
  formatTime,
} from "../../../lib/forum";
import {
  createComment,
  createProfile,
  deleteComment,
  describeSupabaseError,
  fetchComments,
  fetchPost,
  UsernameTakenError,
} from "@/lib/supabase/forum";
import { SupabaseConfigError } from "@/lib/supabase/client";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { profile, loaded: profileLoaded, completeProfile } = useCurrentProfile();
  const { isAdmin } = useAdmin();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPost(id), fetchComments(id)])
      .then(([p, c]) => {
        if (cancelled) return;
        setPost(p);
        setComments(c);
        setNotFound(!p);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const needsUsername = profileLoaded && profile === null;

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

  // 根据 comment.id 求楼层号（从 1 开始，实时计算，不写死）
  function floorOf(commentId: string | null): number | null {
    if (!commentId) return null;
    const idx = comments.findIndex((c) => c.id === commentId);
    return idx === -1 ? null : idx + 1;
  }

  const replyTargetFloor = replyToId ? floorOf(replyToId) : null;
  const canSubmit = replyText.trim().length > 0 && !submitting;

  function startReply(commentId: string) {
    setReplyToId(commentId);
    setReplyError(null);
    textareaRef.current?.focus();
  }

  function cancelReply() {
    setReplyToId(null);
    setReplyText("");
    setReplyError(null);
  }

  async function handleReply() {
    const content = replyText.trim();
    if (!content || !post || !profile) return;
    if (content.length > COMMENT_MAX_LENGTH) return;

    setSubmitting(true);
    setReplyError(null);
    try {
      await createComment({
        post_id: post.id,
        user_id: profile.id,
        content,
        reply_to: replyToId,
      });
      const refreshed = await fetchComments(post.id);
      setComments(refreshed);
      setReplyText("");
      setReplyToId(null);
    } catch (e) {
      console.error("[createComment] 失败：", e);
      setReplyError(describeSupabaseError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("确定要删除这条回帖吗？")) return;
    try {
      await deleteComment(commentId);
      if (post) {
        const refreshed = await fetchComments(post.id);
        setComments(refreshed);
      }
    } catch (e) {
      console.error("[deleteComment] 失败：", e);
      window.alert("删除失败：没有权限或发生错误。");
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
        <div className="mb-8">
          <Link
            href="/forum"
            className="text-sm text-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline"
          >
            [ 返回论坛 ]
          </Link>
        </div>

        {!loaded ? (
          <p className="text-sm text-foreground/40">読み込み中……</p>
        ) : !post ? (
          <div>
            <p className="text-sm text-foreground/60">帖子不存在。</p>
            <Link
              href="/forum"
              className="mt-3 inline-block text-sm text-foreground/70 underline transition hover:text-foreground"
            >
              [ 返回论坛 ]
            </Link>
          </div>
        ) : (
          <>
            {/* 原帖：标题 → 用户名/时间 → 正文，靠留白突出，不加标签 */}
            <article className="pb-8">
              {post.title && (
                <h1 className="font-serif text-3xl leading-snug sm:text-[2.125rem]">
                  {post.title}
                </h1>
              )}

              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm text-foreground/80">
                  {post.username}
                </span>
                <time
                  dateTime={post.created_at}
                  className="text-xs tabular-nums text-foreground/45"
                >
                  {formatTime(post.created_at)}
                </time>
              </div>

              {post.content && (
                <p className="mt-6 whitespace-pre-wrap text-lg leading-[1.8] text-foreground/90">
                  {post.content}
                </p>
              )}
            </article>

            {/* 回帖列表：与原帖之间用更粗的分割线 */}
            <section className="border-t-2 border-foreground/40">
              {comments.length === 0 ? (
                <p className="py-6 text-sm text-foreground/45">还没有回帖。</p>
              ) : (
                <div className="divide-y divide-foreground/15">
                  {comments.map((comment, index) => {
                    const floor = index + 1;
                    const targetFloor = comment.reply_to
                      ? floorOf(comment.reply_to)
                      : null;
                    return (
                      <div key={comment.id} className="py-5">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-serif text-sm text-foreground/85">
                            {floor}L
                          </span>
                          {targetFloor ? (
                            <span className="text-xs text-foreground/55">
                              回复 {targetFloor}L
                            </span>
                          ) : null}
                          <span className="text-sm text-foreground/80">
                            {comment.username}
                          </span>
                          <time
                            dateTime={comment.created_at}
                            className="ml-auto text-xs tabular-nums text-foreground/45"
                          >
                            {formatTime(comment.created_at)}
                          </time>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-base leading-[1.75] text-foreground/85">
                          {comment.content}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-3">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-foreground/60 underline-offset-4 transition hover:text-foreground hover:underline"
                            >
                              [ 删除 ]
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startReply(comment.id)}
                            className="text-xs text-foreground/60 underline-offset-4 transition hover:text-foreground hover:underline"
                          >
                            [ 回复 ]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 回帖输入区域 */}
            <section className="mt-8">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm text-foreground/60">
                  {replyToId !== null && replyTargetFloor !== null
                    ? `回复 ${replyTargetFloor}L`
                    : "发表回帖"}
                </h2>
                <span className="text-xs tabular-nums text-foreground/45">
                  {replyText.length} / {COMMENT_MAX_LENGTH}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) =>
                  setReplyText(e.target.value.slice(0, COMMENT_MAX_LENGTH))
                }
                maxLength={COMMENT_MAX_LENGTH}
                rows={4}
                placeholder="回帖内容"
                className="mt-2 w-full resize-y border border-foreground/25 bg-black/40 px-3 py-2 text-base leading-relaxed text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
              />
              {replyError && (
                <p className="mt-2 text-xs text-foreground/60">{replyError}</p>
              )}
              <div className="mt-3 flex justify-end gap-3">
                {replyToId !== null && (
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="border border-foreground/30 px-4 py-1.5 text-sm text-foreground/85 transition hover:bg-foreground/10"
                  >
                    取消
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={!canSubmit}
                  className="border border-foreground/40 bg-[#ece6d7] px-4 py-1.5 text-sm text-[#201f1b] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                >
                  {submitting ? "发表中…" : "发表回帖"}
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {needsUsername && <UsernameSetupModal onSave={handleSetUsername} />}
    </>
  );
}
