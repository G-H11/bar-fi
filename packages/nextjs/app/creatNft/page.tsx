"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { addToIPFS, uploadImageToIPFS } from "~~/utils/tokenization/ipfs-fetch";
import type { NextPage } from "next";
import HeroSection from "~~/components/HeroSection";

const CreateNft: NextPage = () => {
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
  const { address, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  };

  const handleMintNft = async () => {
    if (!file || !isConnected) {
      notification.error("请上传图片文件并确保钱包已连接");
      return;
    }

    const notificationId = notification.loading("正在上传到 IPFS...");
    try {
      const imageResponse = await uploadImageToIPFS(file);
      const imageUri = `https://gateway.pinata.cloud/ipfs/${imageResponse}`;

      const metadata = {
        name,
        description,
        image: imageUri,
      };

      const metadataResponse = await addToIPFS(metadata);
      const metadataUri = `${metadataResponse.IpfsHash}`;

      notification.remove(notificationId);
      notification.success("元数据已上传到 IPFS");

      await writeContractAsync({
        functionName: "mintItem",
        args: [address, metadataUri, BigInt(0)],
      });

      notification.success("NFT 发行成功！");
    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
      notification.error("发行 NFT 失败");
    }
  };

  return (
    <>
      <HeroSection
        bgImage="/hero-bg-3.png"
        emoji="🍷"
        title="发行 NFT"
        subtitle="酒品链上发行"
      />
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-accent/10 p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            <span className="text-primary">🍷</span> 发行 NFT
          </h1>

          <div className="space-y-5">
            <div>
              <label className="label">
                <span className="label-text text-base-content">上传图片</span>
              </label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base-content">名称</span>
              </label>
              <input type="text" placeholder="NFT 名称" value={name} onChange={e => setName(e.target.value)}
                className="input input-bordered w-full" />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base-content">描述</span>
              </label>
              <textarea placeholder="NFT 描述" value={description} onChange={e => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full" rows={3} />
            </div>

            <button onClick={handleMintNft} className="btn btn-primary w-full text-lg tracking-wide">
              🍷 发行 NFT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNft;
