"use client";

import Link from "next/link";
import { Network, NETWORKS, TOKENS } from "./config";
import { useState } from "react";
import { Listbox } from "@headlessui/react";

export default function Home() {
  const [
    tokenSymbol, setTokenSymbol
  ] = useState(TOKENS[0].symbol);
  const [
    sourceNetworkId, setSourceNetworkId
  ] = useState(TOKENS[0].supported[0].sourceNetworkId);
  const [
    destinationNetworkId, setDestinationNetworkId
  ] = useState(TOKENS[0].supported[0].destinationNetworkId);

  const swapNetworks = () => {
    const temp = sourceNetworkId;
    setSourceNetworkId(destinationNetworkId);
    setDestinationNetworkId(temp);
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col justify-between">
      <div className="flex justify-between px-8 py-4 border-b border-zinc-700 bg-zinc-950">
        <div className="text-zinc-300 text-2xl font-normal">Bridge Interface</div>
        <div className="flex">
          <div className="h-8 px-4 rounded-full bg-zinc-500 pt-1 mr-2">Wallet 1 here</div>
          <div className="h-8 px-4 rounded-full bg-zinc-500 pt-1">Wallet 2 here</div>
        </div>
      </div>

      <div className="max-w-md mx-auto py-8">
        <div className="mx-auto border-zinc-700 rounded-lg border p-6 bg-zinc-900">
          <form className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-right items-center">
                <label className="text-zinc-300 text-xl font-medium pr-4">Token</label>
                {/* todo: https://headlessui.com/react/listbox */}
                <select
                  className="px-2 py-2 border border-zinc-700 rounded bg-zinc-800 text-zinc-100 outline-none"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <BlockchainDropdown
                  label="From"
                  options={NETWORKS}
                  selectedValue={sourceNetworkId}
                  updateSelectedValue={setSourceNetworkId}
                />
                <button
                  type="button"
                  className="mx-2 p-2 text-zinc-300 hover:bg-zinc-700 rounded-xl"
                  onClick={swapNetworks}
                >
                  <ChangeArrow />
                </button>
                <BlockchainDropdown
                  label="To"
                  options={NETWORKS}
                  selectedValue={destinationNetworkId}
                  updateSelectedValue={setDestinationNetworkId}
                />
              </div>
              <input
                type="text"
                placeholder="Amount"
                className="w-full px-2 py-2 border border-zinc-700 rounded outline-none bg-zinc-800 text-zinc-300 placeholder-zinc-500 text-lg"
                pattern="^\d*(\.\d{0,8})?$"
              />
              <input
                type="text"
                placeholder="Receive Address"
                className="w-full px-2 py-2 border border-zinc-700 rounded outline-none bg-zinc-800 text-zinc-300 placeholder-zinc-500 text-lg"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-64 px-2 py-3 border border-zinc-700 rounded-3xl bg-green-500 text-bg font-medium text-zinc-950 hover:bg-green-700 transition-colors duration-300"
              >
                Bridge
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-center pb-4 text-zinc-300">
        <Sparkles />
        <span className="pl-1">powered by</span>
        <Link href="https://warp.green" className="text-green-500 hover:text-green-300 pl-1 pr-2 font-medium underline">warp.green</Link> |
        <Link href="https://docs.warp.green" className="px-2 underline hover:text-zinc-100">Docs</Link> | 
        <Link href="https://twitter.com/warpdotgreen" className="px-2 underline hover:text-zinc-100">Twitter</Link> |
        <Link href="https://github.com/warpdotgreen" className="pl-2 underline hover:text-zinc-100">Github</Link>

      </div>
    </div>
  );
}


type BlockchainDropdownProps = {
  label: string;
  options: Network[];
  selectedValue: string;
  updateSelectedValue: (value: string) => void;
};
function BlockchainDropdown({ label, options, selectedValue, updateSelectedValue }: BlockchainDropdownProps) {
  return (
    <div className="px-2 py-2 relative flex w-full flex-col border border-zinc-700 rounded bg-zinc-800">
      <label className="text-zinc-500 text-sm mb-1">{label}</label>
      <select
        value={selectedValue}
        onChange={(e) => updateSelectedValue(e.target.value)}
        className="flex-1 bg-zinc-800 text-zinc-300 outline-none appearance-none"
      >
        {options.map((n) => (
          <option key={n.id} value={n.id}>{n.displayName}</option>
        ))}
      </select>
    </div>
  );
}


// https://heroicons.com/ 
function ChangeArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

// https://heroicons.com/ 
function Sparkles() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}
