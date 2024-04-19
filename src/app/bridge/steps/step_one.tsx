"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Network, NetworkType, Token, TOKENS } from "../config";
import { ethers } from "ethers";
import { useWriteContract } from "wagmi";
import { ERC20BridgeABI } from "@/app/bridge/util/abis";
import * as GreenWeb from 'greenwebjs';
import { useEffect, useState } from "react";
import { getStepTwoURL } from "./urls";
import { initializeBLS } from "clvm";
import { burnCATs } from "../util/driver";
import { stringToHex } from "@/app/bridge/util/sig";
import { pushTx } from "../util/rpc";

export default function StepOne({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = TOKENS.find((token) => token.symbol === searchParams.get("token"))!;

  const { data: hash, writeContract } = useWriteContract();
  const [waitingForTx, setWaitingForTx] = useState(false);

  useEffect(() => {
    if(hash !== undefined) {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: hash
      }));
    }
  });

  const recipient = searchParams.get('recipient')!;
  const amount = searchParams.get('amount') ?? "";
  
  var decimals = 3;
  if(token.symbol === "ETH" && sourceChain.type == NetworkType.EVM) {
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

  const initiateBridgingFromEVMToChia = async () => {
    const receiver = GreenWeb.util.address.addressToPuzzleHash(recipient);

    setWaitingForTx(true);

    if(token.symbol == "ETH") {
      writeContract({
        address: sourceChain.erc20BridgeAddress as `0x${string}`,
        abi: ERC20BridgeABI,
        functionName: "bridgeEtherToChia",
        args: [
          ("0x" + receiver) as `0x${string}`,
        ],
        value: ethers.parseEther(amount) + sourceChain.messageToll,
        chainId: sourceChain.chainId
      });
    } else {
      writeContract({
        address: sourceChain.erc20BridgeAddress as `0x${string}`,
        abi: ERC20BridgeABI,
        functionName: "bridgeToChia",
        args: [
          token.supported.find((supported) => supported.evmNetworkId === sourceChain.id)!.contractAddress,
          ("0x" + receiver) as `0x${string}`,
          amountMojo
        ],
        chainId: sourceChain.chainId,
        value: sourceChain.messageToll
      });
    }
  }

  const initiateBridgingFromChiaToEVM = async () => {
    setWaitingForTx(true);

    await initializeBLS();

    const tokenInfo = token.supported.find((supported) => supported.coinsetNetworkId === sourceChain.id && supported.evmNetworkId === destinationChain.id)!;
    const offerMojoAmount = BigInt(sourceChain.messageToll) - amountMojo;
    var offer = null;
    try {
      const params = {
        offerAssets: [
          {
            assetId: "",
            amount: parseInt(offerMojoAmount.toString())
          },
          {
            assetId: tokenInfo.assetId,
            amount: parseInt(amountMojo.toString())
          }
        ],
        requestAssets: []
      }
      const response = await (window as any).chia.request({ method: 'createOffer', params })
      if (response.offer) {
        offer = response.offer;
      }
    } catch(e) {
      console.error(e);
    }

    if(!offer) {
      alert("Failed to generate offer");
      setWaitingForTx(false);
      return;
    }
    
    const [sb, nonce] = await burnCATs(
      offer,
      stringToHex(destinationChain.id),
      tokenInfo.contractAddress,
      recipient,
      destinationChain.erc20BridgeAddress!,
      sourceChain.portalLauncherId!,
      parseInt(sourceChain.messageToll.toString()),
      sourceChain.aggSigData!
    );

    const pushTxResp = await pushTx(sourceChain.rpcUrl, sb);
    if(!pushTxResp.success) {
      alert("Failed to push transaction - please check console for more details.");
      console.error(pushTxResp);
      setWaitingForTx(false);
      return;
    } else {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: nonce,
        token: token.symbol,
        recipient,
        amount,
      }));
    }
  };

  return (
    <>
      { token.symbol === "ETH" && (
        <div className="border italic border-zinc-500 bg-zinc-700 rounded-lg px-4 py-2 mb-2">
          Note: {sourceChain.type == NetworkType.EVM ? '':'milli'}Ether will be automatically converted to {destinationChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'} at a rate of {sourceChain.type == NetworkType.EVM ? '1 ETH for 1000 milliETH' : '1000 milliETH for 1 ETH'}.
        </div> 
      )}
      <p className="mb-4">
        To start, please confirm the information below.
        <span className="text-red-500 ml-1">Make sure you have enough assets to pay for one transaction on both networks.</span>  
      </p>
      <p className="text-zinc-500">Sending:</p>
      <p className="px-6">{amount} {token.symbol === "ETH" && sourceChain.type == NetworkType.COINSET ? "milliETH" : token.symbol} ({sourceChain.displayName})</p>
      <p className="px-6">+{' '}
        {ethers.formatUnits(sourceChain.messageToll, sourceChain.type == NetworkType.EVM ? 18 : 12)}
        {sourceChain.type == NetworkType.EVM ? ' ETH ' : ' XCH '}
        ({sourceChain.displayName})
        (toll - will be used as transaction fee)
      </p>
      <p className="text-zinc-500">Receiving (after 0.3% protocol tip):</p>
      { sourceChain.type == NetworkType.COINSET && token.symbol == "ETH" ? (
        <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 6)} ETH ({destinationChain.displayName})</p>
      ) : (
        <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 3)} {token.symbol === "ETH" ? "milliETH" : token.symbol} ({destinationChain.displayName})</p>
      )
      }
      <p className="text-zinc-500">Recipient address:</p>
      <p className="px-6 break-words mb-4">{recipient}</p>
      <div className="flex">
        {!waitingForTx ? (
          <button
            className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
            onClick={sourceChain.type == NetworkType.EVM ? initiateBridgingFromEVMToChia : initiateBridgingFromChiaToEVM}  
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
    </>
  );
}
