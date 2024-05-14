"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { NETWORKS, Network, NetworkType, TOKENS } from "../config"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getStepThreeURL } from "./urls"
import { useQuery } from "@tanstack/react-query"
import { useWriteContract } from "wagmi"
import { decodeSignature, getSigsAndSelectors, RawMessage } from "../drivers/portal"
import { stringToHex } from "../drivers/util"
import { PortalABI } from "../drivers/abis"
import { getCoinRecordByName, pushTx, sbToJSON } from "../drivers/rpc"
import { mintCATs } from "../drivers/erc20bridge"
import { unlockCATs } from "../drivers/catbridge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Loader, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "../ChiaWalletManager/WalletContext"
import AddERCTokenButton from "../assets/components/AddERCTokenButton"
import AddCATButton from "../assets/components/AddCATButton"

export default function StepThree({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  return destinationChain.type === NetworkType.COINSET ? (
    <StepThreeCoinsetDestination
      sourceChain={sourceChain}
      destinationChain={destinationChain}
    />
  ) : (
    <StepThreeEVMDestination
      sourceChain={sourceChain}
      destinationChain={destinationChain}
    />
  )
}

function StepThreeEVMDestination({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const searchParams = useSearchParams()
  const nonce = searchParams.get("nonce")!
  const source = searchParams.get("source")!
  const destination = searchParams.get("destination")! as `0x${string}`
  const contents = JSON.parse(searchParams.get("contents")!).map((c: string) => `0x${c}`) as `0x${string}`[]
  const [waitingForTx, setWaitingForTx] = useState(false)
  const { data: hash, writeContract } = useWriteContract()

  const [sigs, setSigs] = useState<string[]>([])
  useQuery({
    queryKey: ['StepThree_fetchSigsAndSelectors', nonce],
    queryFn: () => getSigsAndSelectors(
      stringToHex(sourceChain.id), stringToHex(destinationChain.id), nonce, null
    ).then((sigsAndSelectors) => {
      setSigs(sigsAndSelectors[0])
      return 1
    }),
    enabled: hash !== undefined || sigs.length < destinationChain.signatureThreshold,
    refetchInterval: 5000,
  })

  if (hash) {
    return (
      <FinalEVMTxConfirmer destinationChain={destinationChain} txId={hash} />
    )
  }

  if (sigs.length < destinationChain.signatureThreshold) {
    return (
      <div className="flex gap-2 items-center bg-background h-14 w-full px-6 rounded-md font-light ">
        <Loader className="w-4 shrink-0 h-auto animate-spin" />
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="animate-pulse"> {`Collecting signatures (${sigs?.length ?? 0}/${destinationChain.signatureThreshold})`}</p>
        </div>
      </div>
    )
  }

  const generateTxPls = async () => {
    setWaitingForTx(true)

    writeContract({
      address: destinationChain.portalAddress! as `0x${string}`,
      abi: PortalABI,
      functionName: "receiveMessage",
      args: [
        ("0x" + nonce) as `0x${string}`,
        ("0x" + stringToHex(sourceChain.id)) as `0x${string}`,
        ("0x" + source) as `0x${string}`,
        destination,
        contents,
        "0x" + sigs.map(sig => decodeSignature(sig)[4]).join("") as `0x${string}`
      ],
      chainId: destinationChain.chainId
    })
  }

  return (
    <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md transition-none animate-in fade-in slide-in-from-bottom-2 duration-500">
      <p className="px-4">
        Click the button below to receive your assets on {destinationChain.displayName}.
        Note that lower fees mean slower confirmations.
      </p>
      <div className="flex mt-6">
        {!waitingForTx ? (
          <Button
            className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
            onClick={generateTxPls}
          >
            Generate Transaction
          </Button>
        ) : (
          <Button
            className="relative flex items-center gap-2 w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
            disabled={true}
          >
            <p className="animate-pulse whitespace-normal">Waiting for transaction approval</p>
          </Button>
        )}
      </div>
    </div>
  )
}


function StepThreeCoinsetDestination({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const offer: string | null = searchParams.get("offer")

  const [status, setStatus] = useState("Loading...")
  const [key, setKey] = useState(0)
  useEffect(() => {
    // Update status key to re-trigger fade-in animation
    setKey(prevKey => prevKey + 1)
  }, [status])

  const nonce: `0x${string}` = (searchParams.get("nonce") ?? "0x") as `0x${string}`
  const source = searchParams.get("source") ?? ""
  const destination = searchParams.get("destination") ?? ""
  const contents = JSON.parse(searchParams.get("contents") ?? "[]")

  const isNativeCAT = contents.length == 2

  const destTxId = searchParams.get("tx")
  useQuery({
    queryKey: ['StepThree_buildAndSubmitTx'],
    queryFn: async () => {
      const rawMessage: RawMessage = {
        nonce: nonce.replace("0x", ""),
        destinationHex: destination.replace("0x", ""),
        destinationChainHex: stringToHex(destinationChain.id),
        sourceHex: source.replace("0x", ""),
        sourceChainHex: stringToHex(sourceChain.id),
        contents: contents.map((c: string) => c.replace("0x", "")),
      }

      var sb, txId
      if (!isNativeCAT) { // wrapped ERC20s
        try {
          [sb, txId] = await mintCATs(
            offer!,
            rawMessage,
            destinationChain,
            setStatus
          )
        } catch (_) {
          console.error(_)
          toast.error("Failed to mint wrapped ERC-20 CATs.", { duration: 20000, id: "failed-to-mint-erc20" })
        }
      } else {
        // native CATs being unwrapped
        // find asset id via bruteforce
        var assetId: string = "00".repeat(32)
        TOKENS.forEach((token) => {
          token.supported.forEach((tokenInfo) => {
            if (tokenInfo.contractAddress === source) {
              assetId = tokenInfo.assetId
            }
          })
        })

        try {
          [sb, txId] = await unlockCATs(
            offer!,
            rawMessage,
            assetId === "00".repeat(32) ? null : assetId,
            sourceChain,
            destinationChain,
            setStatus
          )
        } catch (_) {
          console.error(_)
          toast.error("Failed to unlock CATs.", { duration: 20000, id: "failed-to-unlock-cats" })
        }
      }

      const pushTxResp = await pushTx(destinationChain.rpcUrl, sb)
      if (!pushTxResp.success) {
        const sbJson = sbToJSON(sb)
        await navigator.clipboard.writeText(JSON.stringify(sbJson, null, 2))
        toast.error("Failed to push transaction - please check console for more details.", { duration: 20000, id: "failed-to-push-transaction" })
        console.error(pushTxResp)
      } else {
        router.push(getStepThreeURL({
          sourceNetworkId: sourceChain.id,
          destinationNetworkId: destinationChain.id,
          destTransactionId: txId
        }))
      }

      return 1
    },
    enabled: offer !== null && destTxId === null,
  })

  if (!offer && !destTxId) {
    const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`
    const source = searchParams.get("source")!
    const destination = searchParams.get("destination")!
    const contents = JSON.parse(searchParams.get("contents")!)
    const amount = parseInt(contents[2], 16)

    return (
      <GenerateOfferPrompt
        destinationChain={destinationChain}
        amount={isNativeCAT ? 1 : amount}
        onOfferGenerated={(offer) => {
          router.push(getStepThreeURL({
            sourceNetworkId: sourceChain.id,
            destinationNetworkId: destinationChain.id,
            nonce,
            source,
            destination,
            contents,
            offer,
          }))
        }}
      />
    )
  }

  if (!destTxId) {
    return (
      <div className="flex gap-2 items-center bg-background h-14 w-full px-6 rounded-md font-light">
        <Loader className="w-4 shrink-0 h-auto animate-spin" />
        <div key={key} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="animate-pulse">{status}</p>
        </div>
      </div>
    )
  }

  return (
    <FinalCoinsetTxConfirmer destinationChain={destinationChain} txId={destTxId!} />
  )
}

function GenerateOfferPrompt({
  destinationChain,
  amount,
  onOfferGenerated,
}: {
  destinationChain: Network,
  amount: number,
  onOfferGenerated: (offer: string) => void
}) {
  const [waitingForTx, setWaitingForTx] = useState(false)
  const { createOffer } = useWallet()

  const generateOfferPls = async () => {
    setWaitingForTx(true)
    try {
      const params = {
        offerAssets: [
          {
            assetId: "",
            amount: amount
          }
        ],
        requestAssets: []
      }
      const offer = await createOffer(params)
      if (offer) {
        onOfferGenerated(offer)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setWaitingForTx(false)
    }
  }

  return (
    <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      <p className="px-4">
        Click the button below to create an offer for minting wrapped assets on {destinationChain.displayName}.
        Note that lower fees mean slower confirmations.
      </p>
      <div className="flex mt-6">
        {!waitingForTx ? (
          <Button
            className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
            onClick={generateOfferPls}
          >
            Generate Offer
          </Button>
        ) : (
          <Button
            className="relative flex items-center gap-2 w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
            disabled={true}
          >
            <p className="animate-pulse whitespace-normal">Waiting for transaction approval</p>
          </Button>
        )}
      </div>
    </div>
  )
}

function FinalCoinsetTxConfirmer({
  destinationChain,
  txId,
}: {
  destinationChain: Network,
  txId: string
}) {
  const [coinRecord, setCoinRecord] = useState<any>(null)
  const includedInBlock = coinRecord?.spent === true

  const searchParams = useSearchParams()
  const destinationAddr = searchParams.get('destination') as string

  const { data } = useQuery({
    queryKey: ['StepThree_getCoinRecordByName', txId],
    queryFn: () => getCoinRecordByName(destinationChain.rpcUrl, txId).then((res) => {
      setCoinRecord(res)
      return 1
    }),
    enabled: !includedInBlock,
    refetchInterval: 5000,
  })

  return (
    <div className="flex flex-col">
      <div className="p-6 py-4 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2">
          <TriangleAlert className="opacity-80 w-4 h-auto" />
          <p className="opacity-80">Don&apos;t see your bridged asset?</p>
          <Button variant="ghost" className="ml-auto" asChild><Link href={`/bridge/assets?addAssets=${destinationAddr}`}>+ Add to Wallet</Link></Button>
        </div>
      </div>
      <div className="p-6 my-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="font-extralight opacity-80 mb-4">Transaction ID</p>
        <p className="text-xl font-light">{txId}</p>
      </div>
      <div className="p-6 bg-background flex gap-2 font-light rounded-md animate-[delayed-fade-in_0.7s_ease_forwards]">
        {
          includedInBlock ? (
            <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="font-extralight opacity-80 mb-4">Transaction Sent</p>
              <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" asChild>
                <Link href={`${destinationChain.explorerUrl}/coin/0x${txId}`} target="_blank">Verify on SpaceScan <ArrowUpRight className="w-5 mb-3 h-auto" /></Link>
              </Button>
            </div>
          ) : (
            <>
              <Loader className="w-4 shrink-0 h-auto animate-spin" />
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="animate-pulse">Waiting for transaction to be included in a block...</p>
              </div>
            </>
          )
        }
      </div>
    </div>
  )
}

function FinalEVMTxConfirmer({
  destinationChain,
  txId,
}: {
  destinationChain: Network,
  txId: string
}) {
  const searchParams = useSearchParams()
  const destinationAddr = searchParams.get('destination') as string
  const toChainName = searchParams.get('to')
  const chainId = NETWORKS.find(n => n.id === toChainName)?.chainId
  return (
    <div className="flex flex-col">
      <div className="p-6 py-4 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2">
          <TriangleAlert className="opacity-80 w-4 h-auto" />
          <p className="opacity-80">Don&apos;t see your bridged asset?</p>
          {chainId ? <AddERCTokenButton tokenAddress={destinationAddr} tokenChainId={chainId} /> : <Button variant="ghost" className="ml-auto" asChild><Link href={`/bridge/assets?addAssets=${destinationAddr}`}>+ Add to Wallet</Link></Button>}
        </div>
      </div>
      <div className="p-6 my-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="font-extralight opacity-80 mb-4">Transaction ID</p>
        <p className="text-xl font-light">{txId}</p>
      </div>
      <div className="p-6 bg-background flex gap-2 font-light rounded-md animate-[delayed-fade-in_0.7s_ease_forwards]">
        <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="font-extralight opacity-80 mb-4">Transaction Confirmed</p>
          <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" asChild>
            <Link href={`${destinationChain.explorerUrl}/tx/${txId}`} target="_blank">View on Explorer <ArrowUpRight className="w-5 mb-3 ml-0.5 h-auto" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}