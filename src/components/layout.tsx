import type { PropsWithChildren } from "react";

export default function PageLayout(props: PropsWithChildren) {
  return (
    <main className="flex h-screen justify-center ">
      <div className="md:max-w-2xl h-full  w-full overflow-y-scroll border-x border-slate-400">
        {props.children}
      </div>
    </main>
  );
}
