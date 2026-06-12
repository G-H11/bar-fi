"use client";

import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Transfers: NextPage = () => {
  const { data: transferEvents, isLoading } = useScaffoldEventHistory({
    contractName: "YourCollectible", eventName: "Transfer",
  });

  if (isLoading) return <div className="flex justify-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="flex items-center flex-col pt-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">🔄</span> 所有转账记录
          </h1>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-accent/10">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300 text-base-content/80">
                <th className="text-primary">Token ID</th>
                <th className="text-primary">From</th>
                <th className="text-primary">To</th>
              </tr>
            </thead>
            <tbody>
              {!transferEvents || transferEvents.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-base-content py-8">暂无转账记录</td></tr>
              ) : (
                transferEvents.map((event, i) => (
                  <tr key={i} className="hover:bg-base-200">
                    <th className="text-center text-primary">{event.args.tokenId?.toString()}</th>
                    <td><Address address={event.args.from} /></td>
                    <td><Address address={event.args.to} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
