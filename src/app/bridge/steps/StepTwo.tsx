"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Network, NetworkType, TOKENS, wagmiConfig } from "../config"
import { useBlockNumber, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt } from "wagmi"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { getStepThreeURL, getStepTwoURL } from "./urls"
import { useQuery } from "@tanstack/react-query"
import { getBlockchainState, getCoinRecordByName } from "../drivers/rpc"
import { getMessageSentFromXCHStepThreeData } from "../drivers/portal"
import { L1BlockABI } from "../drivers/abis"
import { Loader } from "lucide-react"
import Link from "next/link"

export default function StepTwo({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const searchParams = useSearchParams()
  const txHash: string = searchParams.get("tx")!

  return (
    <div>
      {sourceChain.id !== 'xch' && <div className="px-2 mb-4 text-white p-2 rounded-md text-center">
        New to Chia? While you wait, learn more about our favorite blockchain at <Link href="https://xch.network/" target="_blank" rel="noopener noreferrer" className="text-green-500 font-semibold underline hover:opacity-80">XCH.network</Link>.
      </div>}
      <div className="flex items-center justify-center">
        <div className="flex gap-2 items-center bg-background h-14 w-full px-6 rounded-md font-light">
          <Loader className="w-4 shrink-0 h-auto animate-spin" />
          <div className="animate-pulse">
            {sourceChain.type === NetworkType.EVM ? (
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
      </div>
    </div>
  )
}


function XCHValidationElement({
  txHash,
  sourceChain,
}: {
  txHash: string,
  sourceChain: Network,
}) {
  const router = useRouter()
  const [includedBlockNumber, setIncludedBlockNumber] = useState(0)

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
        const nonce = txHash

        router.push(getStepThreeURL(
          await getMessageSentFromXCHStepThreeData(sourceChain, nonce)
        ))
      }}
    />
  )
}

function XCHMempoolFollower({
  sourceChainRpcUrl,
  coinId,
  setBlock
}: {
  sourceChainRpcUrl: string,
  coinId: string,
  setBlock: (block: number) => void,
}) {
  const { data } = useQuery({
    queryKey: ['StepTwo_fetchCoinRecordByName', coinId],
    queryFn: () => getCoinRecordByName(sourceChainRpcUrl, coinId).then((record) => record ?? false),
    enabled: true,
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (data && data.confirmed_block_index > 0) {
      setBlock(data.confirmed_block_index)
    }
  }, [data, setBlock])

  return (
    <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">Waiting for transaction to be included in a block...</p>
  )
}

function XCHBlockConfirmer({
  sourceChainRpcUrl,
  txInclusionBlock,
  confirmationMinHeight,
  onConfirmation,
}: {
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
  })

  const confirmations = (data?.peak?.height ?? txInclusionBlock) - txInclusionBlock

  useEffect(() => {
    if (confirmations >= confirmationMinHeight) {
      onConfirmation()
    }
  }, [confirmations, confirmationMinHeight, onConfirmation])

  return (
    <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">Confirming transaction ({Math.max(Math.min(confirmations, confirmationMinHeight), 0).toString()}/{confirmationMinHeight})</p>
  )
}

function EVMValidationTextElement({
  txHash,
  sourceChain,
  destinationChain,
}: {
  txHash: `0x${string}`,
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter()
  const txReceipt = useWaitForTransactionReceipt({
    hash: txHash,
    onReplaced: (replacement) => {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: replacement.replacedTransaction.hash,
      }))
    },
  })
  
  const chainId = useChainId()
  const { switchChain } = useSwitchChain({ config: wagmiConfig })
  useEffect(() => {
    if(chainId !== sourceChain.chainId) {
      console.log({
          message: "requesting user to switch network",
          currentChainId: chainId,
          tatgetChainId: sourceChain.chainId
      })
      switchChain({ chainId: sourceChain.chainId! })
    }
  }, [switchChain, chainId, sourceChain.chainId])

  if (!txReceipt.isSuccess) {
    return (
      <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">Waiting for transaction to be included in a block...</p>
    )
  }

  if (sourceChain.l1BlockContractAddress) {
    return (
      <BaseValidationTextElement
        txReceipt={txReceipt}
        sourceChain={sourceChain}
        destinationChain={destinationChain}
      />
    )
  }

  return (
    <EthereumValidationTextElement
      txReceipt={txReceipt}
      sourceChain={sourceChain}
      destinationChain={destinationChain}
    />
  )
}

const getNonceAndNavigate = (
  txReceipt: any,
  sourceChainId: string,
  destinationChainId: string,
  router: any
) => {
  const eventSignature = ethers.id("MessageSent(bytes32,address,bytes3,bytes32,bytes32[])")
  const eventLog = (txReceipt!.data as any).logs.filter((log: any) => log.topics[0] === eventSignature)[0]

  const nonce = eventLog.topics[1]

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
  )

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
  const router = useRouter()
  const blockNumberResp = useBlockNumber({
    watch: true,
  })

  const txConfirmationHeight = BigInt((txReceipt.data as any).blockNumber)
  const currentBlockNumber = blockNumberResp.isSuccess ? blockNumberResp.data : txConfirmationHeight

  const currentConfirmations = currentBlockNumber - BigInt(txConfirmationHeight)

  useEffect(() => {
    if (txReceipt.isSuccess && currentConfirmations >= BigInt(sourceChain.confirmationMinHeight)) {
      getNonceAndNavigate(txReceipt, sourceChain.id, destinationChain.id, router)
    }
  }, [
    txReceipt, currentConfirmations, sourceChain.confirmationMinHeight, sourceChain.id, destinationChain.id, router
  ])

  return (
    <span className="animate-in fade-in slide-in-from-bottom-2 duration-500">Confirming transaction ({Math.max(Math.min(parseInt(currentConfirmations.toString()), sourceChain.confirmationMinHeight), 0)}/{sourceChain.confirmationMinHeight})</span>
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
  const router = useRouter()
  const blockNumberWhenTxConfirmedResp = useReadContract({
    address: sourceChain.l1BlockContractAddress!,
    abi: L1BlockABI,
    functionName: "number",
    blockNumber: (txReceipt.data as any).blockNumber,
  })
  const blockNumberNowResp = useReadContract({
    address: sourceChain.l1BlockContractAddress!,
    abi: L1BlockABI,
    functionName: "number",
    blockTag: "latest",
    query: {
      refetchInterval: 5000,
    }
  })

  const currentConfirmations = blockNumberWhenTxConfirmedResp.isSuccess && blockNumberNowResp.isSuccess ?
    (blockNumberNowResp.data as bigint) - (blockNumberWhenTxConfirmedResp.data as bigint) : BigInt(0)

  useEffect(() => {
    if (txReceipt.isSuccess && currentConfirmations >= BigInt(sourceChain.confirmationMinHeight)) {
      getNonceAndNavigate(txReceipt, sourceChain.id, destinationChain.id, router)
    }
  }, [
    txReceipt, currentConfirmations, sourceChain.confirmationMinHeight, sourceChain.id, destinationChain.id, router
  ])

  return (
    <span className="animate-in fade-in slide-in-from-bottom-2 duration-500">Confirming transaction ({Math.max(Math.min(parseInt(currentConfirmations.toString()), sourceChain.confirmationMinHeight), 0)}/{sourceChain.confirmationMinHeight})</span>
  )
}
