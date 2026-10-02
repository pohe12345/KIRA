import Link from "next/link";
import { type Post, formatTime } from "../../lib/forum";

interface PostItemProps {
  post: Post;
  isAdmin: boolean;
  onDelete: (postId: string) => void;
}

export default function PostItem({ post, isAdmin, onDelete }: PostItemProps) {
  return (
    <div className="border-b border-foreground/15 py-5">
      <Link
        href={`/forum/post/${post.id}`}
        className="block transition hover:bg-white/5"
      >
        {/* 1. 标题（最上方，不限制行数） */}
        {post.title && (
          <h2 className="font-serif text-base leading-snug sm:text-lg">
            {post.title}
          </h2>
        )}

        {/* 2. 用户名（左）+ 发布时间（右），同一行，位于标题与正文之间 */}
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xs text-neutral-500">{post.username}</span>
          <time
            dateTime={post.created_at}
            className="text-xs tabular-nums text-neutral-500"
          >
            {formatTime(post.created_at)}
          </time>
        </div>

        {/* 3. 正文摘要：只显示一行，超出用省略号（CSS truncate，不用 JS 截取） */}
        {post.content && (
          <p className="mt-2 truncate text-sm leading-relaxed text-foreground/80">
            {post.content}
          </p>
        )}

        <span className="mt-2.5 block text-xs text-foreground/50">
          回帖 {post.comment_count ?? 0}
        </span>
      </Link>

      {isAdmin && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="text-xs text-foreground/60 underline-offset-4 transition hover:text-foreground hover:underline"
          >
            [ 删除帖子 ]
          </button>
        </div>
      )}
    </div>
  );
}
