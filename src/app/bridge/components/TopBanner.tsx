import { Button } from "@/components/ui/button";
import { TESTNET } from "../config"
import { useEffect, useState } from "react";
import Link from "next/link";

const BETA_BANNER_CLOSED_KEY = "beta-banner-closed";

function TopBanner() {
  const [showBetaBanner, setShowBetaBanner] = useState(false);
  useEffect(() => {
    const bannerClosed = window.localStorage.getItem(BETA_BANNER_CLOSED_KEY);
    setShowBetaBanner(bannerClosed !== "true");
  }, []);

  return (
    <>
      {TESTNET && (
        <div className="bg-destructive text-center w-full py-2 px-4 font-light">
          <p>This is a testnet interface. Do not use mainnet funds. Make sure Goby is on <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">testnet11</span> and your Ethereum wallet is on <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">Sepolia</span> or <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">Base Sepolia</span>.</p>
        </div>
      )}
      {showBetaBanner && (
        <div className="bg-theme-purple text-center w-full px-4 font-light flex items-center justify-between">
          <p className="flex-grow text-center py-2">We&apos;re currently in <span className="font-medium">Beta</span>. More audits are scheduled. <Link
            href="https://docs.warp.green/#what-does-beta-mean"
            target="_blank"
            className="underline font-medium hover:opacity-90 whitespace-nowrap"
          >Learn more</Link></p>
          <Button className="bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 ml-auto p-0 m-0" onClick={() => {
            window.localStorage.setItem(BETA_BANNER_CLOSED_KEY, "true");
            setShowBetaBanner(false);
          }}>
            <XMarkIcon />
          </Button>
        </div>
      )}
    </>
  );
}

// https://heroicons.com/
function XMarkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default TopBanner
