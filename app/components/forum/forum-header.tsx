interface ForumHeaderProps {
  username: string;
  onCreatePost: () => void;
}

export default function ForumHeader({
  username,
  onCreatePost,
}: ForumHeaderProps) {
  return (
    <header className="border-b border-foreground/15 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <h1 className="font-serif text-2xl font-bold tracking-[0.15em] sm:text-3xl">
          救世主キラ
        </h1>

        <nav className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={onCreatePost}
            className="text-foreground/80 underline-offset-4 transition hover:text-foreground hover:underline"
          >
            [ 发布帖子 ]
          </button>
        </nav>
      </div>

      <p className="mt-3 text-sm text-foreground/55">
        当前用户名：{username || "……"}
      </p>
    </header>
  );
}
