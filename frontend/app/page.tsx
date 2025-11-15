import Image from "next/image";
import React from "react";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-[#5b6f71]">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-[#ececee] dark:bg- sm:items-start">
        <span style={{ color: "black" }}> FinPal on progress... </span>
        <Image src="/finPal.png" alt="FinPal Logo" width={200} height={200} />
      </main>
    </div>
  );
}
