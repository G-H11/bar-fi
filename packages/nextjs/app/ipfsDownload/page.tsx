"use client";

import { lazy, useEffect, useState } from "react";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/tokenization/ipfs-fetch";

const LazyReactJson = lazy(() => import("react-json-view"));

const IpfsDownload: NextPage = () => {
  const [yourJSON, setYourJSON] = useState({});
  const [ipfsPath, setIpfsPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleIpfsDownload = async () => {
    setLoading(true);
    const nid = notification.loading("Getting data from IPFS");
    try {
      const metaData = await getMetadataFromIPFS(ipfsPath);
      notification.remove(nid);
      notification.success("Downloaded from IPFS");
      setYourJSON(metaData);
    } catch (error) {
      notification.remove(nid);
      notification.error("Error downloading");
      console.log(error);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center flex-col pt-10 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="text-primary">⬇️</span> IPFS Download
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            className="input input-bordered flex-1"
            placeholder="IPFS CID or URL"
            value={ipfsPath}
            onChange={e => setIpfsPath(e.target.value)}
            autoComplete="off"
          />
          <button className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading} onClick={handleIpfsDownload}>
            ⬇️
          </button>
        </div>

        {mounted && (
          <div className="bg-base-100 rounded-2xl shadow-xl border border-accent/10 p-4">
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
      </div>
    </div>
  );
};

export default IpfsDownload;
