"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/tokenization/ipfs-fetch";
import type { NFTMetaData } from "~~/utils/tokenization/nftsMetadata";

const PAGE_SIZE = 3;

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  uri: string;
  owner: string;
  price: bigint;
  listed: boolean;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { data: yourCollectibleContract } = useScaffoldContract({ contractName: "YourCollectible" });
  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "balanceOf", args: [connectedAddress], watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async () => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined) return;
      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const Item = await yourCollectibleContract.read.getAllListedNfts();
      for (let i = 0; i < Item.length; i++) {
        try {
          const tokenItem = await yourCollectibleContract.read.getNftItem([Item[i].tokenId]);
          const tokenURI = await yourCollectibleContract.read.tokenURI([Item[i].tokenId]);
          const nftMetadata: NFTMetaData = await getMetadataFromIPFS(tokenURI as string);
          collectibleUpdate.push({
            id: parseInt(Item[i].tokenId.toString()), uri: tokenURI as string, owner: connectedAddress,
            price: tokenItem.price, listed: tokenItem.isListed, ...nftMetadata,
          });
        } catch (e) { notification.error("获取收藏品时出错"); setAllCollectiblesLoading(false); console.log(e); }
      }
      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };
    updateMyCollectibles();
  }, [connectedAddress, myTotalBalance]);

  // Reset to page 1 when list changes
  useEffect(() => { setPage(1); }, [myAllCollectibles.length]);

  const totalPages = Math.max(1, Math.ceil(myAllCollectibles.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = myAllCollectibles.slice(startIdx, startIdx + PAGE_SIZE);

  if (allCollectiblesLoading) return <div className="flex justify-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center mt-10"><div className="text-2xl text-base-content">暂无在售 NFT</div></div>
      ) : (
        <>
          <div className="flex flex-wrap gap-5 justify-center">
            {pageItems.map(item => <NFTCard nft={item} key={item.id} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                className="btn btn-sm"
                style={{ background: page <= 1 ? "transparent" : "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", opacity: page <= 1 ? 0.3 : 1 }}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← 上一页
              </button>
              <span className="text-sm text-primary/60">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-sm"
                style={{ background: page >= totalPages ? "transparent" : "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", opacity: page >= totalPages ? 0.3 : 1 }}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                下一页 →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};
