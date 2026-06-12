"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { parseEther } from "viem";
import HeroSection from "~~/components/HeroSection";

const weiToEth = (wei: bigint) => parseFloat(wei.toString()) / 1e18;

const ListNFT: NextPage = () => {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [ownerStatus, setOwnerStatus] = useState<"loading" | "owner" | "notOwner" | "notExist" | null>(null);
  const [listingFee, setListingFee] = useState<bigint>(BigInt(0));
  const [royaltyReceiver, setRoyaltyReceiver] = useState<string | null>(null);
  const [royaltyAmount, setRoyaltyAmount] = useState<bigint>(BigInt(0));

  // 获取合约实例用于检查 token 是否存在
  const { data: yourCollectibleContract } = useScaffoldContract({ contractName: "YourCollectible" });

  const { data: ownerOf } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });
  const { data: royaltyInfo } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "royaltyInfo",
    args: tokenId && price ? [BigInt(tokenId), parseEther(price)] : undefined,
  });
  const { data: calculatedListingFee } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "calculateListingFee",
    args: price ? [parseEther(price)] : undefined,
  });

  const { writeContractAsync: placeNftOnSale, isMining } = useScaffoldWriteContract("YourCollectible");

  // 判断 tokenId 是否存在以及持有状态
  useEffect(() => {
    if (!tokenId) {
      setOwnerStatus(null);
      return;
    }
    if (ownerOf) {
      setOwnerStatus(
        ownerOf.toLowerCase() === address?.toLowerCase() ? "owner" : "notOwner"
      );
    }
  }, [ownerOf, address, tokenId]);

  // 如果 tokenId 存在但 ownerOf 没返回（revert），说明 token 不存在
  useEffect(() => {
    if (!tokenId || !yourCollectibleContract) return;
    const checkExists = async () => {
      try {
        await yourCollectibleContract.read.ownerOf([BigInt(tokenId)]);
      } catch {
        setOwnerStatus("notExist");
      }
    };
    checkExists();
  }, [tokenId, yourCollectibleContract]);

  useEffect(() => { if (royaltyInfo) { const [r, a] = royaltyInfo; setRoyaltyReceiver(r); setRoyaltyAmount(a); } }, [royaltyInfo]);
  useEffect(() => { if (calculatedListingFee) setListingFee(calculatedListingFee); }, [calculatedListingFee]);

  const handleListNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId || !price) return void notification.error("请提供 Token ID 和价格");
    if (ownerStatus !== "owner") return void notification.error("你不是这个 NFT 的所有者");
    try {
      const tx = await placeNftOnSale({ functionName: "placeNftOnSale", args: [BigInt(tokenId), parseEther(price)], value: listingFee });
      if (tx) notification.success("上架成功！"); else notification.error("交易失败");
    } catch (error) { console.error(error); notification.error("上架失败"); }
  };

  const renderOwnerStatus = () => {
    if (!tokenId) return null;
    switch (ownerStatus) {
      case "owner":
        return <div className="p-3 rounded-xl text-sm bg-success/10 text-success">✅ 你是此 NFT 的所有者</div>;
      case "notOwner":
        return <div className="p-3 rounded-xl text-sm bg-error/10 text-error">❌ 你未持有此 NFT</div>;
      case "notExist":
        return <div className="p-3 rounded-xl text-sm bg-warning/10 text-warning">⚠️ 该 Token ID 不存在</div>;
      case "loading":
        return <div className="p-3 rounded-xl text-sm bg-primary/10 text-primary">⏳ 查询中...</div>;
      default:
        return null;
    }
  };

  const canSubmit = ownerStatus === "owner";

  return (
    <>
      <HeroSection
        bgImage="/hero-bg-5.png"
        emoji="🏪"
        title="上架 NFT"
        subtitle="酒品上架交易"
      />
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-accent/10 p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            <span className="text-primary">🏪</span> 上架 NFT
          </h1>
          <form onSubmit={handleListNFT} className="space-y-5">
            <div>
              <label className="label"><span className="label-text text-base-content">Token ID</span></label>
              <input className="input input-bordered w-full" type="number" placeholder="输入 Token ID"
                value={tokenId} onChange={e => setTokenId(e.target.value)} required />
            </div>
            <div>
              <label className="label"><span className="label-text text-base-content">价格 (ETH)</span></label>
              <input className="input input-bordered w-full" type="number" step="0.000000000000000001" placeholder="输入 ETH 价格"
                value={price} onChange={e => setPrice(e.target.value)} required />
            </div>

            {renderOwnerStatus()}
            {listingFee > BigInt(0) && (
              <div className="p-3 rounded-xl bg-primary/10 text-primary text-sm">
                上架费: {weiToEth(listingFee)} ETH
              </div>
            )}
            {royaltyAmount > BigInt(0) && royaltyReceiver && (
              <div className="p-3 rounded-xl bg-accent/10 text-accent text-sm">
                版税: {weiToEth(royaltyAmount)} ETH → {royaltyReceiver?.slice(0, 6)}...
              </div>
            )}

            <button className="btn btn-primary w-full text-lg tracking-wide" type="submit" disabled={isMining || !canSubmit}>
              {isMining ? "上架中..." : "🏪 上架"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ListNFT;
