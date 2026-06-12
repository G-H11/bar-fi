"use client";

import { MyHoldings } from "./_components";
import type { NextPage } from "next";
import HeroSection from "~~/components/HeroSection";

const BuyNft: NextPage = () => {
  return (
    <>
      <HeroSection
        bgImage="/hero-bg-6.png"
        emoji="🥂"
        title="吧台市场"
        subtitle="浏览在售珍酿，品鉴收藏"
      />
      <div className="flex items-center flex-col pt-10 px-4">
        <div className="w-full max-w-6xl">
          <MyHoldings />
        </div>
      </div>
    </>
  );
};

export default BuyNft;
