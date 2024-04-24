"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Network, NetworkType, Token, TOKENS } from "../config";
import { ethers } from "ethers";
import { useAccount, usePrepareTransactionRequest, useReadContract, useTransactionConfirmations, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20ABI, ERC20BridgeABI } from "@/app/bridge/util/abis";
import * as GreenWeb from 'greenwebjs';
import { useEffect, useState } from "react";
import { getStepTwoURL } from "./urls";
import { initializeBLS } from "clvm";
import { burnCATs, sbToJSON } from "../util/driver";
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
  const recipient = searchParams.get('recipient')!;
  const amount = searchParams.get('amount') ?? "";

  const token: Token = TOKENS.find((token) => token.symbol === searchParams.get("token"))!;
  
  var decimals = 3;
  if(token.symbol === "ETH" && sourceChain.type == NetworkType.EVM) {
    decimals = 6;
  }
  if(token.symbol === "XCH" && sourceChain.type == NetworkType.COINSET) {
    decimals = 12;
  }

  var amountMojo: bigint;
  try {
    amountMojo = ethers.parseUnits(amount, decimals);
  } catch(_) {
    alert("Invalid amount - 3 decimal places allowed for any token, except for ETH (6 decimal places) and XCH (12 decimal places)");
    router.back();
    return <></>;
  }
  
  const amountMojoAfterFee = amountMojo - amountMojo * BigInt(30) / BigInt(10000);

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
        (toll)
      </p>
      <p className="text-zinc-500">Receiving (after 0.3% protocol tip):</p>
      { sourceChain.type == NetworkType.COINSET && token.symbol == "ETH" ? (
        <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 6)} ETH ({destinationChain.displayName})</p>
      ) : (
        sourceChain.type == NetworkType.COINSET && token.symbol == "XCH" ? (
          <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 12)} XCH ({destinationChain.displayName})</p>
        ): (
          <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 3)} {token.symbol === "ETH" ? "milliETH" : token.symbol} ({destinationChain.displayName})</p>
        )
      )
      }
      <p className="text-zinc-500">Recipient address:</p>
      <p className="px-6 break-words mb-4">{recipient}</p>
      <div className="flex">
        {sourceChain.type == NetworkType.COINSET ? (
          <ChiaButton
            token={token}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            recipient={recipient}
            amount={amount}
            amountMojo={amountMojo}
          />
        ) : (
          <EthereumButton
            token={token}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            recipient={recipient}
            amount={amount}
            amountMojo={amountMojo}
          />
        )}
      </div>
    </>
  );
}

function EthereumButton({
  token,
  sourceChain,
  destinationChain,
  recipient,
  amount,
  amountMojo
} : {
  token: Token,
  sourceChain: Network,
  destinationChain: Network,
  recipient: string,
  amount: string,
  amountMojo: bigint
}) {
  const tokenInfo = token.supported.find((supported) => supported.evmNetworkId === sourceChain.id)!;

  const router = useRouter();
  const account = useAccount();
  const [waitingForTx, setWaitingForTx] = useState(false);

  // allowance stuff
  const { data: tokenDecimalsFromContract } = useReadContract({
    address: tokenInfo.contractAddress,
    abi: erc20ABI,
    functionName: "decimals",
    args: [],
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenInfo.contractAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      account.address!, sourceChain.erc20BridgeAddress!
    ],
  });
  const approvedEnough = allowance && tokenDecimalsFromContract && allowance >= ethers.parseUnits(amount, tokenDecimalsFromContract);

  const { data: approvalTxHash, writeContract: writeContractForApproval } = useWriteContract();

  const { data: approvalTxConfirmations } = useTransactionConfirmations({
    hash: approvalTxHash,
    query: {
      enabled: approvalTxHash !== undefined && !approvedEnough,
      refetchInterval: 1000,
    }
  });

  useEffect(() => {
    if(approvalTxConfirmations ?? 0 > 0) {
      refetchAllowance();
    }
  }, [approvalTxConfirmations, refetchAllowance]);
  // end allowance stuff

  const { data: hash, writeContract } = useWriteContract();

  useEffect(() => {
    if(hash !== undefined) {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: hash
      }));
    }
  });

  if(waitingForTx) {
    return (
      <LoadingButton text="Waiting for transaction approval" />
    );
  }

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
  };

  const approveTokenSpend = async () => {
    writeContractForApproval({
      address: tokenInfo.contractAddress,
      abi: erc20ABI,
      functionName: "approve",
      args: [
        sourceChain.erc20BridgeAddress as `0x${string}`,
        BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
      ]
    });
  }

  if(!approvedEnough) {
    if(approvalTxHash) {
      return (
        <LoadingButton text="Waiting for transaction confirmation" />
      );
    }

    return (
      <ActionButton
        onClick={approveTokenSpend}
        text="Approve token spend"
      />
    );
  }

  return (
    <ActionButton
      onClick={initiateBridgingFromEVMToChia}
      text="Initiate Bridging"
    />
  );
}

function ChiaButton({
  token,
  sourceChain,
  destinationChain,
  recipient,
  amount,
  amountMojo
} : {
  token: Token,
  sourceChain: Network,
  destinationChain: Network,
  recipient: string,
  amount: string,
  amountMojo: bigint
}) {
  const router = useRouter();
  const [waitingForTx, setWaitingForTx] = useState(false);

  const initiateBridgingFromChiaToEVM = async () => {
    setWaitingForTx(true);

    await initializeBLS();

    const tokenInfo = token.supported.find((supported) => supported.coinsetNetworkId === sourceChain.id && supported.evmNetworkId === destinationChain.id)!;
    console.log({ reqAssetId: tokenInfo.assetId });
    
    var offerMojoAmount = BigInt(sourceChain.messageToll)
    if(token.sourceNetworkType == NetworkType.EVM) {
      // We'll melt CAT mojos and use them as a fee as well
      offerMojoAmount -= amountMojo;
    }
    var offer = null;

    // either requesting XCH (toll) + asset or just XCH (toll + asset)
    var xchAmount = parseInt(offerMojoAmount.toString());
    var offerAssets = [];
    if(tokenInfo.assetId === "00".repeat(32)) {
      console.log({ xchAmount })
      xchAmount += parseInt(amountMojo.toString());
      console.log({ xchAmount })
    } else {
      offerAssets.push({
        assetId: tokenInfo.assetId,
        amount: parseInt(amountMojo.toString())
      })
    }
    offerAssets.push({
      assetId: "",
      amount: xchAmount
    });

    try {
      const params = {
        offerAssets: offerAssets,
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
      const sbJson = sbToJSON(sb);
      await navigator.clipboard.writeText(JSON.stringify(sbJson, null, 2));
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

  if(waitingForTx) {
    return (
      <LoadingButton text="Waiting for transaction..." />
    );
  }

  return (
    <ActionButton
      text="Initiate Bridging"
      onClick={initiateBridgingFromChiaToEVM}
    />
  );
}

function ActionButton({
  text,
  onClick
} : {
  text: string,
  onClick: () => Promise<void>
}) {
  return (
    <button
      className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
      onClick={onClick}  
    >
      {text}
    </button>
  );
}

function LoadingButton({
  text
} : {
  text: string
}) {
  return (
    <button
      className="rounded-full text-zinc-100 bg-zinc-800 max-w-xs w-full px-4 py-2 font-medium mx-auto"
      onClick={() => {}}
      disabled={true}  
    >
      {text}
    </button>
  );
}
