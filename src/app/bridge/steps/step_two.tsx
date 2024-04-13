"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { Network } from "../config";
import { useBlockNumber, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { WindToy } from "react-svg-spinners";
import { useEffect } from "react";
import { ethers } from "ethers";
import { L1BlockABI } from "@/app/bridge/util/abis";
import { getStepThreeURL, getStepTwoURL } from "./urls";

export default function StepTwo({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tx_hash: `0x${string}` = searchParams.get("tx")! as `0x${string}`;

  const txReceipt = useWaitForTransactionReceipt({
    hash: tx_hash,
    onReplaced: (replacement) => {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        tx_hash: replacement.replacedTransaction.hash,
      }));
    },
  });

  return (
    <div className="text-zinc-300 flex font-medium text-md items-center justify-center">
      <div className="flex items-center">
        <WindToy color="rgb(212 212 216)" />
        {
          txReceipt.isSuccess ? (
            sourceChain.l1BlockContractAddress ? (
              <BaseValidationTextElement
                txReceipt={txReceipt}
                sourceChain={sourceChain}
                destinationChain={destinationChain}
              />
            ) : (
              <EthereumValidationTextElement
                txReceipt={txReceipt}
                sourceChain={sourceChain}
                destinationChain={destinationChain}
              />
            )
          ) : (
            <p className="pl-2">Waiting for transaction to be included in a block...</p>
          )
        }
      </div>
    </div>
  );
}

const getNonceAndNavigate = (
  txReceipt: any,
  sourceChainId: string,
  destinationChainId: string,
  router: any
) => {
  const eventSignature = ethers.id("MessageSent(bytes32,address,bytes3,bytes32,bytes32[])");
  const eventLog = (txReceipt!.data as any).logs.filter((log: any) => log.topics[0] === eventSignature)[0];

  const nonce = eventLog.topics[1];
  console.log({ nonce });

  /* 
  event MessageSent(
      bytes32 indexed nonce,
      address source,
      bytes3 destination_chain,
      bytes32 destination,
      bytes32[] contents
  );
  */

  const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
      ["address", "bytes3", "bytes32", "bytes32[]"],
      eventLog.data
  );

  const queryString = new URLSearchParams({
    step: "3",
    source: sourceChainId,
    destination: destinationChainId,
    nonce: nonce,
    from: decodedData[0],
    to: decodedData[2],
    contents: JSON.stringify(decodedData[3])
  }).toString();

  router.push(getStepThreeURL({
    sourceNetworkId: sourceChainId,
    destinationNetworkId: destinationChainId,
    nonce,
    source: decodedData[0],
    destination: decodedData[2],
    contents: decodedData[3]
  }))
}


function EthereumValidationTextElement({
  txReceipt,
  sourceChain,
  destinationChain
}: {
  txReceipt: ReturnType<typeof useWaitForTransactionReceipt>,
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const blockNumberResp = useBlockNumber({
    watch: true,
  });

  const txConfirmationHeight = BigInt((txReceipt.data as any).blockNumber);
  const currentBlockNumber = blockNumberResp.isSuccess ? blockNumberResp.data : txConfirmationHeight;

  const currentConfirmations = currentBlockNumber - BigInt(txConfirmationHeight);

  useEffect(() => {
    if(txReceipt.isSuccess && currentConfirmations >= BigInt(sourceChain.confirmationMinHeight)) {
      getNonceAndNavigate(txReceipt, sourceChain.id, destinationChain.id, router);
    }
  }, [
    txReceipt, currentConfirmations, sourceChain.confirmationMinHeight, sourceChain.id, destinationChain.id, router
  ]);

  return (
    <span className="ml-2">Confirming transaction ({currentConfirmations.toString()}/{sourceChain.confirmationMinHeight})</span>
  )
}


function BaseValidationTextElement({
  txReceipt,
  sourceChain,
  destinationChain
}: {
  txReceipt: ReturnType<typeof useWaitForTransactionReceipt>,
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const blockNumberWhenTxConfirmedResp = useReadContract({
    address: sourceChain.l1BlockContractAddress!,
    abi: L1BlockABI,
    functionName: "number",
    blockNumber: (txReceipt.data as any).blockNumber,
  });
  const blockNumberNowResp = useReadContract({
    address: sourceChain.l1BlockContractAddress!,
    abi: L1BlockABI,
    functionName: "number",
    blockTag: "latest",
    query: {
      refetchInterval: 5000,
    }
  });

  const currentConfirmations = blockNumberWhenTxConfirmedResp.isSuccess && blockNumberNowResp.isSuccess ?
    (blockNumberNowResp.data as bigint) - (blockNumberWhenTxConfirmedResp.data as bigint) : BigInt(0);

  useEffect(() => {
    if(txReceipt.isSuccess && currentConfirmations >= BigInt(sourceChain.confirmationMinHeight)) {
      getNonceAndNavigate(txReceipt, sourceChain.id, destinationChain.id, router);
    }
  }, [
    txReceipt, currentConfirmations, sourceChain.confirmationMinHeight, sourceChain.id, destinationChain.id, router
  ]);

  return (
    <span className="ml-2">Confirming transaction ({currentConfirmations.toString()}/{sourceChain.confirmationMinHeight})</span>
  )
}
