"use client"
import { useAccount, useAccountEffect } from "wagmi";
import { Network, NETWORKS, NetworkType, TOKENS } from "./../config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Token } from "../config";
import { getStepOneURL } from "./urls";
import { useWallet } from "../ChiaWalletManager/WalletContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepZero() {
  const router = useRouter();
  const defaultToken = TOKENS[1];
  const [tokenSymbol, setTokenSymbol] = useState(defaultToken.symbol);

  const token = TOKENS.find((t: Token) => t.symbol === tokenSymbol)!;
  const initialSourceNetworks = NETWORKS.filter(network =>
    defaultToken.supported.some(support => support.coinsetNetworkId === network.id && defaultToken.sourceNetworkType !== NetworkType.EVM) ||
    defaultToken.supported.some(support => support.evmNetworkId === network.id && defaultToken.sourceNetworkType === NetworkType.EVM)
  );

  const initialDestinationNetworks = NETWORKS.filter(network =>
    defaultToken.supported.some(support => support.coinsetNetworkId === network.id && defaultToken.sourceNetworkType === NetworkType.EVM) ||
    defaultToken.supported.some(support => support.evmNetworkId === network.id && defaultToken.sourceNetworkType !== NetworkType.EVM)
  );

  const [sourceNetworks, setSourceNetworks] = useState(initialSourceNetworks);
  const [destinationNetworks, setDestinationNetworks] = useState(initialDestinationNetworks);

  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sourceNetworkId, setSourceNetworkId] = useState(initialSourceNetworks[0].id);
  const [destinationNetworkId, setDestinationNetworkId] = useState(initialDestinationNetworks[0].id);

  const account = useAccount();
  useAccountEffect({
    onConnect: (account) => {
      if (account?.address !== undefined && NETWORKS.find((n: Network) => n.id === destinationNetworkId)?.type === NetworkType.EVM) {
        setDestinationAddress(account.address);
      }
    }
  });

  const goToFirstStep = async () => {
    router.push(getStepOneURL({
      sourceNetworkId,
      destinationNetworkId,
      tokenSymbol,
      recipient: destinationAddress,
      amount
    }));
  };

  const { walletConnected, address } = useWallet();

  const updateDestinationAddress = (destNetworkId: string) => {
    if (account?.address !== undefined && NETWORKS.find((n: Network) => n.id === destNetworkId)?.type === NetworkType.EVM) {
      setDestinationAddress(account.address);
    } else if (walletConnected && address && NETWORKS.find((n: Network) => n.id === destNetworkId)?.type === NetworkType.COINSET) {
      setDestinationAddress(address);
    } else {
      setDestinationAddress("");
    }
  };

  const swapNetworks = () => {
    const temp = sourceNetworkId;
    setSourceNetworkId(destinationNetworkId);
    setDestinationNetworkId(temp);
    updateDestinationAddress(temp);
  };

  const onTokenChange = (newValue: string) => {
    const newToken = TOKENS.find((t: Token) => t.symbol === newValue)!;
    setTokenSymbol(newValue);

    const newSourceNetworkId = newToken.sourceNetworkType !== NetworkType.EVM
      ? newToken.supported[0].coinsetNetworkId
      : newToken.supported[0].evmNetworkId;

    const newDestinationNetworkId = newToken.sourceNetworkType === NetworkType.EVM
      ? newToken.supported[0].coinsetNetworkId
      : newToken.supported[0].evmNetworkId;

    setSourceNetworkId(newSourceNetworkId);
    setDestinationNetworkId(newDestinationNetworkId);
    updateDestinationAddress(newDestinationNetworkId);

    // Update source and destination networks
    const updatedSourceNetworks = NETWORKS.filter(network =>
      newToken.supported.some(support => support.coinsetNetworkId === network.id && newToken.sourceNetworkType !== NetworkType.EVM) ||
      newToken.supported.some(support => support.evmNetworkId === network.id && newToken.sourceNetworkType === NetworkType.EVM)
    );

    const updatedDestinationNetworks = NETWORKS.filter(network =>
      newToken.supported.some(support => support.coinsetNetworkId === network.id && newToken.sourceNetworkType === NetworkType.EVM) ||
      newToken.supported.some(support => support.evmNetworkId === network.id && newToken.sourceNetworkType !== NetworkType.EVM)
    );

    setSourceNetworks(updatedSourceNetworks);
    setDestinationNetworks(updatedDestinationNetworks);
  };

  useEffect(() => {
    if (!address) {
      setDestinationAddress("");
    } else if (walletConnected && address && NETWORKS.find((n: Network) => n.id === destinationNetworkId)?.type === NetworkType.COINSET) {
      setDestinationAddress(address);
    }
  }, [walletConnected, address, destinationNetworkId]);

  return (
    <div className="max-w-md mx-auto w-full grow flex flex-col justify-center py-8">
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            {/* Amount Input & Token Selector */}
            <div className="flex flex-col gap-4 bg-accent border rounded-lg p-2 animate-[delayed-fade-in_0.7s_ease_forwards]">
              <div className="flex items-center h-14 w-full gap-2">
                <label htmlFor="tokenSelector" className="text-xl pr-4 mr-auto sr-only">
                  Token amount
                </label>
                <Input
                  type="text"
                  placeholder="Amount"
                  className="text-xl h-full border-0"
                  pattern="^\\d*(\\.\\d{0,8})?$"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Select defaultValue={tokenSymbol} value={tokenSymbol} onValueChange={onTokenChange}>
                  <SelectTrigger id="tokenSelector" className="text-xl w-[180px] h-full pr-4 border-0 bg-theme-purple hover:opacity-80 rounded-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENS.map((t: Token) => (
                      <SelectItem key={t.symbol} value={t.symbol} className="text-xl">
                        {t.getSpecificSymbol(sourceNetworkId, destinationNetworkId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chain Selector/Switcher */}
            <div className="bg-accent border border-input rounded-lg p-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
              <BlockchainDropdown
                label="From"
                options={sourceNetworks}
                selectedValue={sourceNetworkId}
                updateSelectedValue={setSourceNetworkId}
              />
              <Button
                variant="ghost"
                type="button"
                className="mx-2 mt-7 p-2 border-0 text-neutral-500 hover:opacity-80 rounded-xl"
                onClick={swapNetworks}
              >
                <ArrowRightLeft />
              </Button>
              <BlockchainDropdown
                label="To"
                options={destinationNetworks}
                selectedValue={destinationNetworkId}
                updateSelectedValue={setDestinationNetworkId}
              />
            </div>

            <div className={cn("flex justify-center", !walletConnected || account?.address == undefined || !Boolean(amount) && 'cursor-not-allowed')}>
              <Button
                type="submit"
                className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
                onClick={goToFirstStep}
                disabled={Boolean(!amount) || !walletConnected || account?.address == undefined}
              >
                {!walletConnected || account?.address == undefined ? "Connect Wallets First"
                  : Boolean(amount) ? "Bridge" : "Enter an Amount"}
              </Button>
            </div>

            {/* Memecoin warning */}
            {token.memecoin && (
              <div className="pt-2">
                <div className="text-orange-800 font-semibold bg-orange-400 text-center border-2 border-orange-800 border-input rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
                  {tokenSymbol} is a Chia-based memecoin added to the bridge by the Chia community. Listing on this interface does NOT represent endorsement from the warp.green team. Do your own research before transacting with {tokenSymbol}.
                </div>
              </div>
            )}

            {/* Additional warning */}
            {token.additionalWarning !== null && (
              <div className="pt-1">
                <div className="text-orange-800 font-semibold bg-orange-400 text-center border-2 border-orange-800 border-input rounded-lg p-4 flex items-center justify-between animate-in fade-in-from-top-2 duration-500">
                  {token.additionalWarning}
                </div>
              </div>
            )}
          </div>
        </div>
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
    <div className="w-full flex flex-col gap-1">
      <p className="px-2 opacity-80">{label}</p>
      <Select onValueChange={updateSelectedValue} value={selectedValue} defaultValue={selectedValue}>
        <SelectTrigger className="text-xl border-0 rounded-sm hover:opacity-80 h-14">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem className="text-xl" key={n.id} value={n.id}>
              {n.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// https://heroicons.com/ 
function ChangeArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  )
}
