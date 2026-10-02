import Link from "next/link";

export default function EnterButton() {
  return (
    <Link
      href="/forum"
      className="
        inline-flex
        h-7
        w-[140px]
        items-center
        justify-center
        border
        border-[#3a3a34]
        bg-[#ece6d7]
        font-serif
        text-sm
        font-bold
        tracking-widest
        text-[#201f1b]
        transition-[filter]
        duration-200
        hover:brightness-110
      "
    >
      ENTER
    </Link>
  );
}