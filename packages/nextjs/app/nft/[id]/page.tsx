'use client';

import { useEffect, useState } from 'react';
import { useScaffoldReadContract, useScaffoldEventHistory } from '~~/hooks/scaffold-eth';
import { Address } from '@scaffold-ui/components';
import { format } from 'date-fns';
import { formatEther } from 'viem';

const NFTDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [nft, setNft] = useState<any | null>(null);

  const { data: tokenURI } = useScaffoldReadContract({ contractName: 'YourCollectible', functionName: 'tokenURI', args: [BigInt(id)] });
  const { data: owner } = useScaffoldReadContract({ contractName: 'YourCollectible', functionName: 'ownerOf', args: [BigInt(id)] });
  const { data: purchaseEvents, isLoading } = useScaffoldEventHistory({
    contractName: 'YourCollectible', eventName: 'NftPurchased', filters: { tokenId: BigInt(id) }, fromBlock: 0n, blockData: true,
  });

  useEffect(() => {
    if (tokenURI) {
      fetch(tokenURI).then(r => r.json()).then(metadata => setNft({ id, ...metadata, owner })).catch(console.error);
    }
  }, [id, tokenURI, owner]);

  if (!nft) return <div className="flex justify-center mt-20 text-base-content text-xl">加载中...</div>;

  return (
    <div className="flex items-center flex-col pt-10 px-4">
      <div className="w-full max-w-3xl">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-accent/10 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img src={nft.image} alt={nft.name} className="w-full h-80 object-cover" />
            </div>
            <div className="p-6 md:w-1/2 space-y-4">
              <h1 className="text-3xl font-bold"><span className="text-primary">#</span> {nft.name}</h1>
              <p className="text-base-content">{nft.description}</p>
              <div className="flex items-center gap-2 text-sm"><span className="text-base-content">拥有者</span><Address address={nft.owner} /></div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">📜 交易历史</h2>
          {isLoading ? (
            <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>
          ) : !purchaseEvents || purchaseEvents.length === 0 ? (
            <p className="text-base-content text-center py-8">暂无交易记录</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl shadow-lg border border-accent/10">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-300 text-base-content/80">
                    <th className="text-primary">Token ID</th>
                    <th className="text-primary">买家</th>
                    <th className="text-primary">卖家</th>
                    <th className="text-primary">价格</th>
                    <th className="text-primary">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseEvents.map((event, i) => (
                    <tr key={i} className="hover:bg-base-200">
                      <th className="text-center">{event.args.tokenId?.toString()}</th>
                      <td><Address address={event.args.buyer} /></td>
                      <td><Address address={event.args.seller} /></td>
                      <td>{formatEther(event.args.price ?? 0n)} ETH</td>
                      <td className="text-xs text-base-content">{event.block?.timestamp ? format(new Date(Number(event.block.timestamp) * 1000), "yyyy-MM-dd HH:mm") : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDetailPage;
