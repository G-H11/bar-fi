"use client";

import { Collectible } from "./MyHoldings";
import { Address } from "@scaffold-ui/components";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther } from "viem";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  const handlePurchaseNft = async () => {
    try {
      const nid = notification.loading("正在购买...");
      await writeContractAsync({ functionName: "purchaseNft", args: [BigInt(nft.id)], value: nft.price });
      notification.remove(nid);
      notification.success("购买成功！");
    } catch (error) { notification.error("购买失败"); console.error(error); }
  };

  return (
    <div className="card bg-base-100 shadow-lg w-[280px] border border-accent/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
        <div className="flex justify-between items-center pt-2 border-t border-accent/10">
          <span className="text-lg font-bold text-primary">{formatEther(nft.price)} ETH</span>
          <button className="btn btn-primary btn-sm" onClick={handlePurchaseNft}>购买</button>
        </div>
      </div>
    </div>
  );
};
