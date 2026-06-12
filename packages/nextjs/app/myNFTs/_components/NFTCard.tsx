"use client";

import { useState, useEffect } from "react";
import { Collectible } from "./MyHoldings";
import { Address } from "@scaffold-ui/components";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

const STORAGE_KEY = "barfi_user_profile";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  const { address: connectedAddress } = useAccount();
  const [transferToAddress, setTransferToAddress] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [withdrawn, setWithdrawn] = useState(false);

  // 从 localStorage 读取提现地址
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWithdrawalAddress(parsed.withdrawalAddress || "");
      }
    } catch {}
  }, []);

  // 检查该 NFT 是否已提现（通过 localStorage 记录已提现的 tokenId）
  useEffect(() => {
    try {
      const withdrawnIds = JSON.parse(localStorage.getItem("barfi_withdrawn") || "[]");
      if (withdrawnIds.includes(nft.id)) setWithdrawn(true);
    } catch {}
  }, [nft.id]);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  const handleTransfer = async () => {
    if (!transferToAddress) return;
    try {
      await writeContractAsync({ functionName: "transferFrom", args: [nft.owner, transferToAddress, BigInt(nft.id.toString())] });
    } catch (err) { console.error(err); }
  };

  const handleConfirmWithdraw = () => {
    // 记录已提现
    try {
      const withdrawnIds = JSON.parse(localStorage.getItem("barfi_withdrawn") || "[]");
      withdrawnIds.push(nft.id);
      localStorage.setItem("barfi_withdrawn", JSON.stringify(withdrawnIds));
    } catch {}
    setWithdrawn(true);
    setShowWithdrawModal(false);
  };

  // 已提现状态：隐藏转移和提现按钮
  if (withdrawn) {
    return (
      <div className="card bg-base-100 shadow-lg w-[280px] border border-accent/10 opacity-60">
        <figure className="relative">
          <img src={nft.image} alt="" className="h-56 w-full object-cover" />
          <figcaption className="absolute bottom-3 left-3 bg-base-100/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
            # {nft.id}
          </figcaption>
        </figure>
        <div className="card-body p-5 space-y-2">
          <h3 className="card-title text-lg justify-center">{nft.name}</h3>
          <p className="text-sm text-base-content text-center line-clamp-2">{nft.description}</p>
          <div className="text-center text-sm text-primary/60 py-2">✅ 已提现</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card bg-base-100 shadow-lg w-[280px] border border-accent/10 hover:shadow-xl transition-all duration-300">
        <figure className="relative">
          <img src={nft.image} alt="" className="h-56 w-full object-cover" />
          <figcaption className="absolute bottom-3 left-3 bg-base-100/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
            # {nft.id}
          </figcaption>
        </figure>
        <div className="card-body p-5 space-y-2">
          <h3 className="card-title text-lg justify-center">{nft.name}</h3>
          {nft.attributes && (
            <div className="flex flex-wrap gap-1 justify-center">
              {nft.attributes.map((a, i) => <span key={i} className="badge badge-primary badge-sm">{a.value}</span>)}
            </div>
          )}
          <p className="text-sm text-base-content text-center line-clamp-2">{nft.description}</p>
          <div className="flex justify-between text-sm">
            <span className="text-base-content">拥有者</span>
            <Address address={nft.owner} />
          </div>

          {nft.listed && <div className="text-sm text-primary text-center">在售 · {nft.price} ETH</div>}

          <div className="pt-2 border-t border-accent/10 space-y-2">
            <input type="text" placeholder="接收地址 0x..." value={transferToAddress}
              onChange={e => setTransferToAddress(e.target.value)}
              className="input input-bordered input-sm w-full text-xs" />
            <button className="btn btn-primary btn-sm w-full" onClick={handleTransfer} disabled={!transferToAddress}>
              转移
            </button>
            <button
              className="btn btn-sm w-full"
              style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
              onClick={() => setShowWithdrawModal(true)}
            >
              提现
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowWithdrawModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-base-100 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 pointer-events-auto border border-accent/15">
              <h3 className="text-xl font-bold mb-1 text-primary">💰 提现确认</h3>
              <p className="text-sm text-base-content mb-4">请确认提现信息是否正确</p>

              <div className="space-y-3 mb-5">
                <div className="bg-base-200 rounded-xl p-3">
                  <p className="text-xs text-base-content mb-1">NFT</p>
                  <p className="font-semibold">{nft.name} <span className="text-primary">#{nft.id}</span></p>
                </div>
                <div className="bg-base-200 rounded-xl p-3">
                  <p className="text-xs text-base-content mb-1">我的钱包地址</p>
                  <p className="font-mono text-sm break-all">{connectedAddress}</p>
                </div>
                <div className="bg-base-200 rounded-xl p-3">
                  <p className="text-xs text-base-content mb-1">提现目标地址</p>
                  {withdrawalAddress ? (
                    <p className="font-mono text-sm break-all text-primary">{withdrawalAddress}</p>
                  ) : (
                    <p className="text-sm text-error">⚠️ 未设置，请先在 Profile 页面填写提现地址</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowWithdrawModal(false)}>
                  取消
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)", color: "#0a0a0a", border: "none" }}
                  disabled={!withdrawalAddress}
                  onClick={handleConfirmWithdraw}
                >
                  确认提现
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
