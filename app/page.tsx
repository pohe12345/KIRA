import EnterButton from "./components/enter-button";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-foreground">
      {/* 背景图片 */}
      <img
        src="/kira.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center -translate-y-[7%]"
      />
      {/* 黑色半透明遮罩，让文字更容易阅读 */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 前景内容 */}
      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="animate-fade-in flex flex-1 flex-col items-center justify-center px-6 text-center">

          {/* 标题 */}
          <h1
            className="
              -translate-y-[30px]
              mr-[-0.3em]
              font-serif
              text-[3.5rem]
              
              tracking-[0.3em]
              font-black
              text-white/85
              [-webkit-text-stroke:0.6px_black]
              sm:text-[4rem]
              md:text-[4.5rem]
              [text-shadow:0_0_1px_white]
            "
          >
            救世主キラ伝説
          </h1>

          {/* 这里原来的 <Seal /> 已经删除 */}

          <div
            className="
              -translate-y-[30px]
              mt-6
              mr-[-0.3em]
              text-center
              font-['Klee_One','Hiragino_Kaku_Gothic_ProN','Yu_Gothic',sans-serif]
              font-extrabold
              tracking-[0.3em]
              text-white/85
              [-webkit-text-stroke:0.55px_black]
              [text-shadow:0_0_0.5px_white]
              
            "
          >
            {/* 正文 */}
            <div className="text-xl leading-[1.2]  sm:text-2xl">
              <div>世界の犯罪者が次々と</div>
              <div>消えているのは</div>
              <div>キラ様が復活なされたから</div>
              <div>キラ様とは世の悪を絶対許さない</div>
              <div>地獄よりの使者です</div>
            </div>

            {/* 下面两行稍微放大 */}
            <div className="mt-8 text-[1.4rem] leading-[1.3] sm:text-[1.6rem]">
              <div>キラ様の復活を信じる者のみ</div>
              <div className="pl-[1em]">この入り口からお入りなさい</div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <footer className="relative z-10 flex justify-center pb-18 -translate-y-25 translate-x-4">
          <EnterButton />
        </footer>
      </div>
    </main>
  );
}