"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { NETWORKS, NetworkType, TOKENS } from "../config";
import { ethers } from "ethers";
import { useWriteContract } from "wagmi";
import { BRIDGE_CONTRACT_ABI } from "@/util/abis";
import * as GreenWeb from 'greenwebjs';
import { useEffect, useState } from "react";

export default function BridgePageOne() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: hash, writeContract } = useWriteContract();
  const [waitingForTx, setWaitingForTx] = useState(false);

  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"))!;
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"))!;
  const token = TOKENS.find((token) => token.symbol === searchParams.get("token"))!;

  useEffect(() => {
    if(hash !== undefined) {
      const queryString = new URLSearchParams({
      source: sourceChain.id,
      destination: destinationChain.id,
      tx_hash: hash,
    }).toString();

    router.push(`/bridge-step-2?${queryString}`);
    }
  });

  const recipient = searchParams.get('recipient')!;
  const amount = searchParams.get('amount') ?? "";
  
  var decimals = 3;
  if(token.symbol === "ETH") {
    decimals = 6;
  }

  var amountMojo: bigint;
  try {
    amountMojo = ethers.parseUnits(amount, decimals);
  } catch(_) {
    alert("Invalid amount - 3 decimal places allowed for any token, except for ETH, which allows 6 decimal places.");
    router.back();
    return <></>;
  }
  
  const amountMojoAfterFee = amountMojo - amountMojo * BigInt(30) / BigInt(10000);

  const initiateBrudgingFromEVMToChia = async () => {
    const receiver = GreenWeb.util.address.addressToPuzzleHash(recipient);

    setWaitingForTx(true);

    if(token.symbol == "ETH") {
      writeContract({
        address: sourceChain.erc20BridgeAddress as `0x${string}`,
        abi: BRIDGE_CONTRACT_ABI,
        functionName: "bridgeEtherToChia",
        args: [
          ("0x" + receiver) as `0x${string}`,
        ],
        value: ethers.parseEther(amount) + sourceChain.messageFee,
        chainId: sourceChain.chainId
      });
    } else {
      writeContract({
        address: sourceChain.erc20BridgeAddress as `0x${string}`,
        abi: BRIDGE_CONTRACT_ABI,
        functionName: "bridgeToChia",
        args: [
          token.supported.find((supported) => supported.sourceNetworkId === sourceChain.id)!.contractAddress,
          ("0x" + receiver) as `0x${string}`,
          amountMojo
        ],
        chainId: sourceChain.chainId,
        value: sourceChain.messageFee
      });
    }
  }

  return (
    <MultiStepForm
    sourceChainName={sourceChain.displayName}
    destinationChainName={destinationChain.displayName}
    activeStep={1}
    >
      { token.symbol === "ETH" && (
        <div className="border italic border-zinc-500 bg-zinc-700 rounded-lg px-4 py-2 mb-2">
          Note: Ether will be automatically converted to {destinationChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'} at a rate of {sourceChain.type == NetworkType.EVM ? '1 ETH for 1000 milliETH' : '1000 milliETH for 1 ETH'}.
        </div> 
      )}
      <p className="mb-4">
        To start, please confirm the information below.
        <span className="text-red-500 ml-1">Make sure you have enough assets to pay for one transaction on both networks.</span>  
      </p>
      <p className="text-zinc-500">Sending:</p>
      <p className="px-6">{amount} {token.symbol} ({sourceChain.displayName})</p>
      <p className="px-6">+ {ethers.formatEther(sourceChain.messageFee)} ETH ({sourceChain.displayName}) (anti-spam toll)</p>
      <p className="text-zinc-500">Receiving (after 0.3% protocol tip):</p>
      <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 3)} {token.symbol === "ETH" ? "milliETH" : token.symbol} ({destinationChain.displayName})</p>
      <p className="text-zinc-500">Recipient address:</p>
      <p className="px-6 break-words mb-4">{recipient}</p>
      <div className="flex">
        {!waitingForTx ? (
          <button
            className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
            onClick={initiateBrudgingFromEVMToChia}  
          >
            Initiate Bridging
          </button>
        ) : (
          <button
            className="rounded-full text-zinc-100 bg-zinc-800 max-w-xs w-full px-4 py-2 font-medium mx-auto"
            onClick={() => {}}
            disabled={true}  
          >
            Waiting for transaction approval
          </button>
        )}
      </div>
    </MultiStepForm>
  );
}
