"use client";

import { useState, type FormEvent } from "react";
import { USERNAME_MAX_LENGTH } from "../../lib/forum";

interface UsernameSetupModalProps {
  // 返回错误信息字符串，返回 null 表示成功（成功时父组件会卸载此弹窗）
  onSave: (name: string) => Promise<string | null>;
}

export default function UsernameSetupModal({
  onSave,
}: UsernameSetupModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSave = name.trim().length > 0 && !submitting;

  function handleChange(value: string) {
    // 实时限制最多 20 个字符（配合 input 的 maxLength）
    setName(value.slice(0, USERNAME_MAX_LENGTH));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    // 提交时再次校验：不能为空、不能超长
    if (!trimmed || trimmed.length > USERNAME_MAX_LENGTH) return;

    setSubmitting(true);
    setError(null);
    const err = await onSave(trimmed);
    setSubmitting(false);
    if (err) setError(err);
    // 成功时父组件会完成设置并卸载此弹窗，无需在此处理
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
      <div
        className="w-full max-w-md border border-foreground/30 bg-[#131315] p-6"
        role="dialog"
        aria-modal="true"
        aria-label="设置用户名"
      >
        <h2 className="font-serif text-lg tracking-widest">设置用户名</h2>
        <p className="mt-2 text-sm text-foreground/60">
          首次进入论坛，请先设置一个用户名。设置后不可更改。
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="username"
                className="text-sm text-foreground/70"
              >
                用户名
              </label>
              <span className="text-xs tabular-nums text-foreground/45">
                {name.length} / {USERNAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => handleChange(e.target.value)}
              autoFocus
              maxLength={USERNAME_MAX_LENGTH}
              placeholder="用户名（最多 20 个字）"
              className="w-full border border-foreground/25 bg-black/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/60"
            />
            <p className="mt-1.5 text-xs text-foreground/45">用户名最多 20 个字</p>
            {error && <p className="mt-1.5 text-xs text-foreground/70">{error}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!canSave}
              className="border border-foreground/40 bg-[#ece6d7] px-4 py-1.5 text-sm text-[#201f1b] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
            >
              {submitting ? "提交中…" : "进入论坛"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
