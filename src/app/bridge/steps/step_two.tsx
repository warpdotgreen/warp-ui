"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Network, NetworkType, TOKENS } from "../config";
import { useBlockNumber, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { WindToy } from "react-svg-spinners";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { L1BlockABI } from "@/app/bridge/util/abis";
import { getStepThreeURL, getStepTwoURL } from "./urls";
import { useQuery } from "@tanstack/react-query";
import { getBlockchainState, getCoinRecordByName, getPuzzleAndSolution } from "../util/rpc";
import { hexToString } from "../util/sig";
import * as GreenWeb from 'greenwebjs';
import { ConditionOpcode } from "greenwebjs/util/sexp/condition_opcodes";

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
          />
        )}
      </div>
    </div>
  );
}

async function fetchXCHMessageDetailsAndNavigate(
  router: any,
  sourceChain: Network,
  nonce: string,
) {
  const messageCoinRecord = await getCoinRecordByName(sourceChain.rpcUrl, nonce);
  const messageCoinParentSpend = await getPuzzleAndSolution(
    sourceChain.rpcUrl,
    messageCoinRecord.coin.parent_coin_info,
    messageCoinRecord.confirmed_block_index
  );

  const [_, conditionsDict, __] = GreenWeb.util.sexp.conditionsDictForSolution(
    GreenWeb.util.sexp.fromHex(messageCoinParentSpend.puzzle_reveal.slice(2)),
    GreenWeb.util.sexp.fromHex(messageCoinParentSpend.solution.slice(2)),
    GreenWeb.util.sexp.MAX_BLOCK_COST_CLVM
  )
  var createCoinConds = conditionsDict?.get("33" as ConditionOpcode) ?? [];

  createCoinConds.forEach((cond) => {
    if(cond.vars[0] === messageCoinRecord.coin.puzzle_hash.slice(2) &&
       cond.vars[1] === GreenWeb.util.coin.amountToBytes(messageCoinRecord.coin.amount)) {
        const memos = GreenWeb.util.sexp.fromHex(cond.vars[2]);
        
        const destination_chain_id = GreenWeb.util.sexp.toHex(memos.first()).slice(2);
        const destination = GreenWeb.util.sexp.toHex(memos.rest().first()).slice(2);
        
        const contents = GreenWeb.util.sexp.asAtomList(memos.rest().rest()).map((val) => {
          if(val.length === 64) {
            return val;
          }

          return "0".repeat(64 - val.length) + val;
        });

        router.push(getStepThreeURL({
          sourceNetworkId: sourceChain.id,
          destinationNetworkId: hexToString(destination_chain_id),
          nonce,
          source: messageCoinRecord.coin.puzzle_hash.slice(2),
          destination: ethers.getAddress("0x" + destination),
          contents
        }));
      }
  })
}


function XCHValidationElement({
  txHash,
  sourceChain,
} : {
  txHash: string,
  sourceChain: Network,
}) {
  const router = useRouter();
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
      txInclusionBlock={includedBlockNumber}
      confirmationMinHeight={sourceChain.confirmationMinHeight}
      onConfirmation={async () => {
        const nonce = txHash;
        
        await fetchXCHMessageDetailsAndNavigate(router, sourceChain, nonce);
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
  txInclusionBlock,
  confirmationMinHeight,
  onConfirmation,
} : {
  sourceChainRpcUrl: string,
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
