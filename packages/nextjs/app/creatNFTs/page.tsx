"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { addToIPFS, uploadImageToIPFS } from "~~/utils/tokenization/ipfs-fetch";
import type { NextPage } from "next";
import HeroSection from "~~/components/HeroSection";

const CreateNftBatch: NextPage = () => {
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
  const { address, isConnected } = useAccount();
  const [files, setFiles] = useState<File[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []));
  };

  const handleMintNftBatch = async () => {
    if (files.length === 0 || !isConnected || names.length !== files.length || descriptions.length !== files.length) {
      notification.error("请为每个 NFT 提供图片、名称和描述");
      return;
    }

    const notificationId = notification.loading("正在上传到 IPFS...");
    try {
      const imageUris = await Promise.all(files.map(f => uploadImageToIPFS(f)));
      const metadataUris: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const metadata = { name: names[i], description: descriptions[i], image: `https://gateway.pinata.cloud/ipfs/${imageUris[i]}` };
        const metadataResponse = await addToIPFS(metadata);
        metadataUris.push(metadataResponse.IpfsHash);
      }

      notification.remove(notificationId);
      notification.success("元数据已上传到 IPFS");

      await writeContractAsync({
        functionName: "mintBatch",
        args: [address, metadataUris, BigInt(0), BigInt(files.length)],
      });

      notification.success("批量发行成功！");
    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
      notification.error("发行失败");
    }
  };

  return (
    <>
      <HeroSection
        bgImage="/hero-bg-4.png"
        emoji="📦"
        title="批量发行"
        subtitle="一次发行多款酒品"
      />
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-accent/10 p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            <span className="text-primary">📦</span> 批量发行 NFTs
          </h1>

          <div className="space-y-5">
            <div>
              <label className="label"><span className="label-text text-base-content">上传多张图片</span></label>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="file-input file-input-bordered w-full" />
            </div>

            {files.map((_, i) => (
              <div key={i} className="p-4 bg-base-200 rounded-xl border border-accent/5 space-y-3">
                <p className="text-sm font-semibold text-primary/80">NFT #{i + 1}</p>
                <input type="text" placeholder={`NFT ${i + 1} 名称`} value={names[i] || ""}
                  onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n); }}
                  className="input input-bordered w-full" />
                <textarea placeholder={`NFT ${i + 1} 描述`} value={descriptions[i] || ""}
                  onChange={e => { const d = [...descriptions]; d[i] = e.target.value; setDescriptions(d); }}
                  className="textarea textarea-bordered w-full" rows={2} />
              </div>
            ))}

            <button onClick={handleMintNftBatch} className="btn btn-primary w-full text-lg tracking-wide" disabled={files.length === 0}>
              📦 批量发行
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNftBatch;
