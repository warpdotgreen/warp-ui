"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { Network, NetworkType, TOKENS } from "../config";
import { useBlockNumber, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { WindToy } from "react-svg-spinners";
import { use, useEffect, useState } from "react";
import { ethers } from "ethers";
import { L1BlockABI } from "@/app/bridge/util/abis";
import { getStepThreeURL, getStepTwoURL } from "./urls";
import { useQuery } from "@tanstack/react-query";
import { getBlockchainState, getCoinRecordByName } from "../util/rpc";
import { getCATBurnerPuzzle } from "../util/driver";
import { stringToHex } from "../util/sig";
import * as GreenWeb from 'greenwebjs';

export default function StepTwo({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const searchParams = useSearchParams();
  const txHash: string = searchParams.get("tx")!;
  
  return (
    <div className="text-zinc-300 flex font-medium text-md items-center justify-center">
      <div className="flex items-center">
        <WindToy color="rgb(212 212 216)" />
        { sourceChain.type === NetworkType.EVM ? (
          <EVMValidationTextElement
            txHash={txHash as `0x${string}`}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
          />
        ) : (
          <XCHValidationElement
            txHash={txHash as `0x${string}`}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
          />
        )}
      </div>
    </div>
  );
}

function XCHValidationElement({
  txHash,
  sourceChain,
  destinationChain,
} : {
  txHash: string,
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [includedBlockNumber, setIncludedBlockNumber] = useState(0);

  return includedBlockNumber === 0 ? (
    <XCHMempoolFollower
      sourceChainRpcUrl={sourceChain.rpcUrl}
      coinId={txHash}
      setBlock={setIncludedBlockNumber}
    />
  ) : (
    <XCHBlockConfirmer
      sourceChainRpcUrl={sourceChain.rpcUrl}
      coinId={txHash}
      txInclusionBlock={includedBlockNumber}
      confirmationMinHeight={sourceChain.confirmationMinHeight}
      onConfirmation={() => {
        const nonce = txHash;
        const sourcePuzzle = getCATBurnerPuzzle(
          sourceChain.bridgingPuzzleHash!,
          stringToHex(destinationChain.id),
          destinationChain.erc20BridgeAddress!.slice(2) // remove 0x
        );
        const sourcePuzzleHash = GreenWeb.util.sexp.sha256tree(sourcePuzzle);
        
        const token = TOKENS.find((token) => token.symbol === searchParams.get("token")!)!;
        const tokenInfo = token.supported.find((info) => info.evmNetworkId === destinationChain.id && info.coinsetNetworkId == sourceChain.id)!;
        
        let assetContract = tokenInfo.contractAddress.slice(2);
        assetContract = "0x" + assetContract.padStart(64, "0");
        let receiver = searchParams.get("recipient")!.slice(2);
        receiver = "0x" + receiver.padStart(64, "0");

        router.push(getStepThreeURL({
          sourceNetworkId: sourceChain.id,
          destinationNetworkId: destinationChain.id,
          nonce,
          source: sourcePuzzleHash,
          destination: destinationChain.erc20BridgeAddress!,
          contents: [
            assetContract,
            receiver,
            ethers.toBeHex(Math.ceil(parseFloat(searchParams.get("amount")!) * 1000), 32)
          ]
        }));
      }}
    />
  );
}

function XCHMempoolFollower({
  sourceChainRpcUrl,
  coinId,
  setBlock
} : {
  sourceChainRpcUrl: string,
  coinId: string,
  setBlock: (block: number) => void,
}) {
  const { data, refetch } = useQuery({
    queryKey: ['StepTwo_fetchCoinRecordByName', coinId],
    queryFn: () => getCoinRecordByName(sourceChainRpcUrl, coinId).then((record) => record ?? false),
    enabled: true,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if(data && data.confirmed_block_index > 0) {
      setBlock(data.confirmed_block_index);
    }
  }, [data, setBlock]);

  return (
    <p className="pl-2">Waiting for transaction to be included in a block...</p>
  );
}

function XCHBlockConfirmer({
  sourceChainRpcUrl,
  coinId,
  txInclusionBlock,
  confirmationMinHeight,
  onConfirmation,
} : {
  sourceChainRpcUrl: string,
  coinId: string,
  txInclusionBlock: number,
  confirmationMinHeight: number,
  onConfirmation: () => void,
}) {
  const { data, refetch } = useQuery({
    queryKey: ['StepTwo_fetchChiaBlockchainState'],
    queryFn: () => getBlockchainState(sourceChainRpcUrl),
    enabled: true,
    refetchInterval: 5000,
  });

  const confirmations = (data?.peak?.height ?? txInclusionBlock) - txInclusionBlock;

  useEffect(() => {
    if(confirmations >= confirmationMinHeight) {
      onConfirmation();
    }
  }, [confirmations, confirmationMinHeight, onConfirmation]);

  return (
    <p className="pl-2">Confirming transaction ({confirmations.toString()}/{confirmationMinHeight})</p>
  );
}

function EVMValidationTextElement({
  txHash,
  sourceChain,
  destinationChain,
} : {
  txHash: `0x${string}`,
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const txReceipt = useWaitForTransactionReceipt({
    hash: txHash,
    onReplaced: (replacement) => {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: replacement.replacedTransaction.hash,
      }));
    },
  });

  if(!txReceipt.isSuccess) {
    return (
      <p className="pl-2">Waiting for transaction to be included in a block...</p>
    );
  }

  if(sourceChain.l1BlockContractAddress) {
    return (
      <BaseValidationTextElement
        txReceipt={txReceipt}
        sourceChain={sourceChain}
        destinationChain={destinationChain}
      />
    );
  }

  return (
    <EthereumValidationTextElement
      txReceipt={txReceipt}
      sourceChain={sourceChain}
      destinationChain={destinationChain}
    />
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
