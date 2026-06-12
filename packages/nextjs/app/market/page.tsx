"use client";

import { useEffect, useState } from "react";
import { NFTCardOnSale } from "./_components/NFTCardOnSale";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/tokenization/ipfs-fetch";
import type { NFTMetaData } from "~~/utils/tokenization/nftsMetadata";
import { formatEther } from "viem";
import type { NextPage } from "next";

export interface OnSaleCollectible extends Partial<NFTMetaData> {
  tokenId: string;
  price: string;
  seller: string;
  isListed: boolean;
  tokenURI: string;
}

const Market: NextPage = () => {
  const [onSaleCollectibles, setOnSaleCollectibles] = useState<OnSaleCollectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({ contractName: "YourCollectible" });
  const { data: onSaleNfts } = useScaffoldReadContract({
    contractName: "YourCollectible", functionName: "getAllListedNfts", watch: true,
  });

  const fetchListedNfts = async () => {
    setAllCollectiblesLoading(true);
    try {
      const fetchedNfts: OnSaleCollectible[] = await Promise.all(
        (onSaleNfts || []).map(async (item: any) => {
          const tokenURI: string = item.tokenUri;
          let metadata: Partial<NFTMetaData> = {};
          try { metadata = await getMetadataFromIPFS(tokenURI); } catch {}
          return {
            tokenId: item.tokenId.toString(), price: formatEther(item.price).toString(),
            seller: item.seller, isListed: item.isListed, tokenURI, ...metadata,
          };
        })
      );
      setOnSaleCollectibles(fetchedNfts);
    } catch (err) { console.error(err); notification.error("获取失败"); }
    finally { setAllCollectiblesLoading(false); }
  };

  useEffect(() => { if (onSaleNfts && yourCollectibleContract) fetchListedNfts(); }, [onSaleNfts]);

  if (allCollectiblesLoading) return <div className="flex justify-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="flex items-center flex-col pt-10 px-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">🍷</span> 在售酒品
          </h1>
        </div>
        {onSaleCollectibles.length === 0 ? (
          <div className="text-center text-2xl text-base-content mt-10">暂无在售 NFT</div>
        ) : (
          <div className="flex flex-wrap gap-5 justify-center">
            {onSaleCollectibles.map(nft => <NFTCardOnSale nft={nft} key={nft.tokenId} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
