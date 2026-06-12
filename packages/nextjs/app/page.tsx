"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import HeroSection from "~~/components/HeroSection";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "tokenIdCounter", watch: true,
  });

  const { data: listedCount } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "getListedItemsCount", watch: true,
  });

  const displayTotal = totalSupply !== undefined ? Number(totalSupply) : "—";
  const displayListed = listedCount !== undefined ? Number(listedCount) : "—";

  return (
    <div className="flex items-center flex-col grow">
      {/* Hero Section */}
      <HeroSection
        bgImage="/hero-bg.png"
        emoji="🍸"
        title="BarFi"
        subtitle="NFT 吧台 · 酒藏"
        description="欢迎来到 BarFi——融合酒文化与NFT的数字资产交易平台。发行你的珍酿，上架吧台交易，品味链上酒藏的独特魅力。"
      >
        <div className="flex justify-center">
          <Link href="/BuyNft" className="btn btn-lg px-12 text-base font-bold shadow-lg"
            style={{ background: "linear-gradient(135deg, #c8f5ff, #89d7e9)", color: "#026262", border: "none" }}>
            🥂 进入吧台
          </Link>
        </div>
      </HeroSection>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 justify-center -mt-8 mb-12 w-[92%] max-w-3xl relative z-10">
        <div className="stat rounded-xl flex-1 min-w-[130px] shadow-lg" style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="stat-figure text-2xl">🏷️</div>
          <div className="stat-title text-xs tracking-wider uppercase" style={{ color: "#ffd966" }}>总发行量</div>
          <div className="stat-value text-3xl" style={{ color: "var(--color-accent)" }}>{displayTotal}</div>
        </div>
        <div className="stat rounded-xl flex-1 min-w-[130px] shadow-lg" style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="stat-figure text-2xl">🍷</div>
          <div className="stat-title text-xs tracking-wider uppercase" style={{ color: "#ffd966" }}>在售酒品</div>
          <div className="stat-value text-3xl" style={{ color: "var(--color-accent)" }}>{displayListed}</div>
        </div>
        <div className="stat rounded-xl flex-1 min-w-[130px] shadow-lg" style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="stat-figure text-2xl">{isConnected ? "🟢" : "⚫"}</div>
          <div className="stat-title text-xs tracking-wider uppercase" style={{ color: "#ffd966" }}>钱包</div>
          <div className="stat-value text-sm font-mono truncate max-w-[130px]" style={{ color: "var(--color-accent)" }}>
            {isConnected ? `${connectedAddress?.slice(0, 6)}...${connectedAddress?.slice(-4)}` : "未连接"}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-[92%] max-w-5xl mb-14">
        <div className="card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="card-body items-center text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-secondary)" }}>
              <span className="text-3xl">🎨</span>
            </div>
            <h3 className="card-title" style={{ color: "#ffd966" }}>发行酒藏</h3>
            <p className="text-sm" style={{ color: "#b8ecec" }}>上传酒品图片，设定名称描述，一键发行为链上 NFT。</p>
            <div className="card-actions mt-4">
              <Link href="/creatNft" className="btn btn-sm" style={{ background: "var(--color-primary)", color: "var(--color-primary-content)" }}>开始发行</Link>
            </div>
          </div>
        </div>

        <div className="card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="card-body items-center text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-secondary)" }}>
              <span className="text-3xl">🏪</span>
            </div>
            <h3 className="card-title" style={{ color: "#ffd966" }}>上架交易</h3>
            <p className="text-sm" style={{ color: "#b8ecec" }}>选择你的 NFT 酒品，设定价格，上架到吧台市场。</p>
            <div className="card-actions mt-4">
              <Link href="/ListNft" className="btn btn-sm" style={{ background: "var(--color-primary)", color: "var(--color-primary-content)" }}>上架酒品</Link>
            </div>
          </div>
        </div>

        <div className="card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="card-body items-center text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-secondary)" }}>
              <span className="text-3xl">🥂</span>
            </div>
            <h3 className="card-title" style={{ color: "#ffd966" }}>品鉴收藏</h3>
            <p className="text-sm" style={{ color: "#b8ecec" }}>浏览在售珍酿，支付 ETH 购买，丰富你的黑金酒藏。</p>
            <div className="card-actions mt-4">
              <Link href="/BuyNft" className="btn btn-sm" style={{ background: "var(--color-primary)", color: "var(--color-primary-content)" }}>前往吧台</Link>
            </div>
          </div>
        </div>
      </div>

      {/* My NFTs Quick Link */}
      <div className="w-[92%] max-w-5xl mb-12">
        <div className="card rounded-2xl shadow-lg" style={{ background: "var(--color-base-100)", border: "1px solid var(--color-accent)" }}>
          <div className="card-body flex-row items-center justify-between p-6">
            <div>
              <h3 className="font-bold text-lg" style={{ color: "#ffd966" }}>🏷️ 我的酒藏</h3>
              <p className="text-sm" style={{ color: "#b8ecec" }}>查看和管理你拥有的所有 NFT 酒品</p>
            </div>
            <Link href="/myNFTs" className="btn btn-sm" style={{ background: "var(--color-primary)", color: "var(--color-primary-content)" }}>查看</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <div className="w-16 h-px mx-auto mb-3" style={{ background: "linear-gradient(to right, transparent, #ffd966, transparent)" }} />
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#b8ecec" }}>BarFi · Vinothèque</p>
      </div>
    </div>
  );
};

export default Home;
