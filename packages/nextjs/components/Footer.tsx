import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div
                className="btn btn-sm font-normal gap-1 cursor-auto"
                style={{
                  background: "rgba(201,168,76,0.12)",
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>{nativeCurrencyPrice.toFixed(2)}</span>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link
                  href="/blockexplorer"
                  passHref
                  className="btn btn-sm font-normal gap-1"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    color: "#C9A84C",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
          <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-1 w-full py-2">
          {/* Gold divider */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2" />
          <div className="flex items-center gap-3 text-xs text-primary/40">
            <span>🍸</span>
            <span className="tracking-wider">BarFi · 黑金酒藏</span>
            <span>·</span>
            <span>Powered by 🏗️ Scaffold-ETH 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
