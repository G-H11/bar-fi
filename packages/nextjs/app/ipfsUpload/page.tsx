"use client";

import { lazy, useEffect, useState } from "react";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/tokenization/ipfs-fetch";
import nftsMetadata from "~~/utils/tokenization/nftsMetadata";

const LazyReactJson = lazy(() => import("react-json-view"));

const IpfsUpload: NextPage = () => {
  const [yourJSON, setYourJSON] = useState<object>(nftsMetadata[0]);
  const [loading, setLoading] = useState(false);
  const [uploadedIpfsPath, setUploadedIpfsPath] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleIpfsUpload = async () => {
    setLoading(true);
    const nid = notification.loading("Uploading to IPFS...");
    try {
      const uploadedItem = await addToIPFS(yourJSON);
      notification.remove(nid);
      notification.success("Uploaded to IPFS");
      setUploadedIpfsPath(uploadedItem.IpfsHash);
    } catch (error) {
      notification.remove(nid);
      notification.error("Error uploading");
      console.log(error);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center flex-col pt-10 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="text-primary">☁️</span> IPFS Upload
        </h1>

        {mounted && (
          <div className="bg-base-100 rounded-2xl shadow-xl border border-accent/10 p-4 mb-4">
            <LazyReactJson
              style={{ background: "transparent", borderRadius: "0.75rem" }}
              src={yourJSON}
              theme="solarized"
              enableClipboard={false}
              onEdit={edit => setYourJSON(edit.updated_src)}
              onAdd={add => setYourJSON(add.updated_src)}
              onDelete={del => setYourJSON(del.updated_src)}
            />
          </div>
        )}

        <button className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading} onClick={handleIpfsUpload}>
          ☁️ Upload to IPFS
        </button>

        {uploadedIpfsPath && (
          <div className="mt-4 text-center">
            <a href={`https://ipfs.io/ipfs/${uploadedIpfsPath}`} target="_blank" rel="noreferrer" className="link text-primary break-all">
              {`https://ipfs.io/ipfs/${uploadedIpfsPath}`}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpfsUpload;
