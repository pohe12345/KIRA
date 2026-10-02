"use client";

import { useState, type FormEvent } from "react";
import {
  POST_TITLE_MAX_LENGTH,
  POST_BODY_MAX_LENGTH,
} from "../../lib/forum";

interface CreatePostModalProps {
  onClose: () => void;
  // 返回错误信息字符串，返回 null 表示成功（成功时父组件会关闭此弹窗）
  onSubmit: (title: string, body: string) => Promise<string | null>;
}

export default function CreatePostModal({
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    (title.trim().length > 0 || body.trim().length > 0) && !submitting;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    // 提交时再次校验：不能全为空白、不能超长
    if (t.length === 0 && b.length === 0) return;
    if (t.length > POST_TITLE_MAX_LENGTH || b.length > POST_BODY_MAX_LENGTH) {
      return;
    }

    setSubmitting(true);
    setError(null);
    const err = await onSubmit(t, b);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-foreground/30 bg-[#131315] p-6"
        role="dialog"
        aria-modal="true"
        aria-label="发布帖子"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-lg tracking-widest">发布帖子</h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="post-title"
                className="text-sm text-foreground/70"
              >
                标题
              </label>
              <span className="text-xs tabular-nums text-foreground/45">
                {title.length} / {POST_TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, POST_TITLE_MAX_LENGTH))
              }
              maxLength={POST_TITLE_MAX_LENGTH}
              autoFocus
              placeholder="标题"
              className="w-full border border-foreground/25 bg-black/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="post-body"
                className="text-sm text-foreground/70"
              >
                正文
              </label>
              <span className="text-xs tabular-nums text-foreground/45">
                {body.length} / {POST_BODY_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="post-body"
              value={body}
              onChange={(e) =>
                setBody(e.target.value.slice(0, POST_BODY_MAX_LENGTH))
              }
              maxLength={POST_BODY_MAX_LENGTH}
              rows={5}
              placeholder="正文"
              className="w-full resize-y border border-foreground/25 bg-black/40 px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
            />
          </div>

          {error && <p className="text-xs text-foreground/70">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="border border-foreground/30 px-4 py-1.5 text-sm text-foreground/85 transition hover:bg-foreground/10"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="border border-foreground/40 bg-[#ece6d7] px-4 py-1.5 text-sm text-[#201f1b] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
            >
              {submitting ? "发布中…" : "发布"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
