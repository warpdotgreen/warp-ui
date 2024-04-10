"use client";

import { useAccount, useAccountEffect } from "wagmi";
import { Network, NETWORKS, NetworkType, TOKENS } from "./config";
import { useState } from "react";
import { ChiaWalletContext } from "./chia_wallet_context";

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
  const [
    amount, setAmount
  ] = useState("");
  const [
    destinationAddress, setDestinationAddress
  ] = useState("");
  const account = useAccount();

  useAccountEffect({
    onConnect: (account) => {
      if(account?.address !== undefined && NETWORKS.find(n => n.id === destinationNetworkId)?.type === NetworkType.EVM) {
        setDestinationAddress(account!.address);
      }
    }
  });

  return (
    <ChiaWalletContext.Consumer>
      {(chiaWalletContext) => {
        if(chiaWalletContext.connected && NETWORKS.find(n => n.id === destinationNetworkId)?.type === NetworkType.COINSET) {
            setDestinationAddress(chiaWalletContext.address);
          }

        const swapNetworks = () => {
          const temp = sourceNetworkId;
          setSourceNetworkId(destinationNetworkId);
          setDestinationNetworkId(temp);
          
          if(account?.address !== undefined && NETWORKS.find(n => n.id === temp)?.type === NetworkType.EVM) {
            setDestinationAddress(account!.address);
          } else {
            if(chiaWalletContext.connected && NETWORKS.find(n => n.id === temp)?.type === NetworkType.COINSET) {
              setDestinationAddress(chiaWalletContext.address);
            } else {
              setDestinationAddress("");
            }
          }
        };

        return (
          <div className="max-w-md mx-auto py-8">
            <div className="mx-auto border-zinc-700 rounded-lg border p-6 bg-zinc-900">
              <div className="space-y-6">
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Receive Address"
                    className="w-full px-2 py-2 border border-zinc-700 rounded outline-none bg-zinc-800 text-zinc-300 placeholder-zinc-500 text-lg"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                      className="w-64 px-2 py-3 text-zinc-100 rounded-3xl bg-green-500 text-bg hover:bg-green-700 font-semibold transition-colors duration-300"
                  >
                    Bridge
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </ChiaWalletContext.Consumer>
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
