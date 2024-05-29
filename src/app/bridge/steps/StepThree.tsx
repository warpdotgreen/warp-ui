"use client"

import { useRouter, useSearchParams } from "next/navigation"
import * as GreenWeb from 'greenwebjs';
import { NETWORKS, Network, NetworkType, TESTNET, TOKENS, wagmiConfig } from "../config"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getStepThreeURL } from "./urls"
import { useQuery } from "@tanstack/react-query"
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi"
import { bootstrapPortal, decodeSignature, getSigsAndSelectors, PortalInfo, RawMessage } from "../drivers/portal"
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
import { cn } from "@/lib/utils"
import { ethers } from "ethers"
import OrPasteOffer from "./OrOffer";

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

  const wagmiChainId = useChainId()
  const { isConnected: isEthWalletConnected } = useAccount()
  const { switchChainAsync, status } = useSwitchChain({ config: wagmiConfig })

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
      {
        nonce: nonce.replace("0x", ""),
        sourceChainHex: stringToHex(sourceChain.id),
        sourceHex: source.replace("0x", ""),
        destinationChainHex: stringToHex(destinationChain.id),
        destinationHex: destination.replace("0x", ""),
        contents: contents.map(c => c.replace("0x", ""))
      },
      null, destinationChain.signatureThreshold, destinationChain
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

  const switchToCorrectChain = async () => await switchChainAsync({ chainId: destinationChain.chainId! })
  const isOnRightChain = destinationChain.chainId! === wagmiChainId

  const onClick = async () => {
    if (!isOnRightChain) {
      await switchToCorrectChain()
    }
    generateTxPls()
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
            disabled={!isEthWalletConnected}
            className={cn("w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl", status === "pending" && 'animate-pulse')}
            onClick={onClick}
          >
            {isEthWalletConnected ? 'Generate Transaction' : 'Connect ETH Wallet'}
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

  const portalBootstrapCoinId: string | null = searchParams.get("portal_bootstrap_id")
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

  const rawMessage: RawMessage = {
    nonce: nonce.replace("0x", ""),
    destinationHex: destination.replace("0x", ""),
    destinationChainHex: stringToHex(destinationChain.id),
    sourceHex: source.replace("0x", ""),
    sourceChainHex: stringToHex(sourceChain.id),
    contents: contents.map((c: string) => c.replace("0x", "")),
  }

  const isNativeCAT = contents.length == 2

  const destTxId = searchParams.get("tx")
  useQuery({
    queryKey: ['StepThree_buildAndSubmitTx', rawMessage.nonce],
    queryFn: async () => {
      var sb, txId
      if (!isNativeCAT) { // wrapped ERC20s
        try {
          [sb, txId] = await mintCATs(
            portalBootstrapCoinId!,
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
            if (tokenInfo.contractAddress.toLowerCase() === source.toLowerCase()) {
              assetId = tokenInfo.assetId
            }
          })
        })

        try {
          [sb, txId] = await unlockCATs(
            portalBootstrapCoinId!,
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
        if(pushTxResp.status !== "SUCCESS") {
          alert(`Transaction push failed - you might be using a fee that is too low`)
          router.back()
          return;
        }

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
        rawMessage={rawMessage}
        onOfferGenerated={async (portalBootstrapId, offer) => {
          router.push(getStepThreeURL({
            sourceNetworkId: sourceChain.id,
            destinationNetworkId: destinationChain.id,
            nonce,
            source,
            destination,
            contents,
            offer,
            portalBootstrapId
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

function ChiaFeeWarning({
  portalInfo,
}: {
  portalInfo: PortalInfo
}) {
  const originalCost = GreenWeb.BigNumber.from(portalInfo.mempoolSbCost);
  const originalFee = portalInfo.mempoolSbFee.eq(0) ? originalCost.mul(4) : GreenWeb.BigNumber.from(portalInfo.mempoolSbFee);

  const estAdditionalCost = GreenWeb.BigNumber.from("200000000");
  const recommendedFeeMojos: GreenWeb.BigNumber = (
    originalCost.add(estAdditionalCost) // new cost = original_cost + estimated cost for adding new coin spends (200 mil.)
  ).mul(
    (originalFee.add(originalCost)).div(originalCost) // fpc + 1 = original_fee / original_cost + 1 = (original_fee + original_cost) / original_cost
  )

  return (
    <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2">
        <TriangleAlert className="w-12 h-auto opacity-80" />
        <div className="px-2">
          <p><span className="font-medium">The mempool already contains a portal spend</span><span className="opacity-100"> with a fee of {ethers.formatUnits(portalInfo.mempoolSbFee.toString(), 12)} XCH.</span></p>
          <p className="pt-4"><span className="opacity-80">To replace it, it is recommended that you </span><span className="font-medium opacity-100">use a minimum fee of {ethers.formatUnits(recommendedFeeMojos.toString(), 12)} XCH</span>.</p>
          <p className="pt-5 opacity-80">Alternatively, you can wait for the pending transaction to be confirmed, when this warning will disappear.</p>
        </div>
      </div>
    </div>
  );
}

function GenerateOfferPrompt({
  destinationChain,
  rawMessage,
  amount,
  onOfferGenerated,
}: {
  destinationChain: Network,
  rawMessage: RawMessage,
  amount: number,
  onOfferGenerated: (portalInfo: string, offer: string) => Promise<void>
}) {
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null)
  const [status, setStatus] = useState("Fetching portal bootstrap coin id...")
  const [waitingForTx, setWaitingForTx] = useState(false)
  const { createOffer, address } = useWallet()
  const isConnectedToChiaWallet = Boolean(address)

  useQuery({
    queryKey: ['StepThree_bootstrapPortalCoinId', rawMessage.nonce],
    queryFn: async () => {
      try {
        const newPortalInfo = await bootstrapPortal(portalInfo, destinationChain, rawMessage, setStatus);
        setPortalInfo(newPortalInfo)
      } catch(_) {
        console.error(_)
        setStatus("Failed to fetch portal bootstrap coin id.")
      }

      return 1
    },
    refetchInterval: 5000,
  });

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
        onOfferGenerated(portalInfo?.coinId ?? "", offer)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setWaitingForTx(false)
    }
  }

  if(portalInfo === null) {
    return (
      <div className="flex gap-2 items-center bg-background h-14 w-full px-6 rounded-md font-light">
        <Loader className="w-4 shrink-0 h-auto animate-spin" />
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="animate-pulse">{status}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {portalInfo.mempoolSb !== null && <ChiaFeeWarning portalInfo={portalInfo} />}
      <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="px-4">
          Click the button below to create an offer for minting assets on {destinationChain.displayName}.
          Note that using lower fees will result in slower confirmations.
        </p>
        <div className="w-full mt-6">
          {!waitingForTx ? (
            <>
              <Button
                disabled={!isConnectedToChiaWallet}
                className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
                onClick={isConnectedToChiaWallet ? generateOfferPls : () => { }}
              >
                {isConnectedToChiaWallet ? 'Generate Offer via Wallet' : 'Connect Chia Wallet'}
              </Button>
              <OrPasteOffer
                onOfferSubmitted={async (manualOffer: string) => await onOfferGenerated(portalInfo?.coinId ?? "", manualOffer)}
                requiredAssetsStr={`${ethers.formatUnits(amount, 12)} XCH`}
              />
            </>
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
    </>
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
      <div className="p-6 my-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="font-extralight opacity-80 mb-4">Transaction ID</p>
        <p className="text-xl font-light">{txId}</p>
      </div>
        {
        includedInBlock ? (
          <>
            <div className="p-6 bg-background flex gap-2 font-light rounded-md animate-[delayed-fade-in_0.4s_ease_forwards]">
              <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="font-extralight opacity-80 mb-4">Transaction Sent</p>
                <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" asChild>
                  <Link href={`${destinationChain.explorerUrl}coin/0x${txId}`} target="_blank">Verify on SpaceScan <ArrowUpRight className="w-5 mb-3 h-auto" /></Link>
                </Button>
                {destinationChain.explorer2Url && (
                  <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" asChild>
                    <Link href={`${destinationChain.explorer2Url}txns/0x${txId}`} target="_blank">Verify on XCHScan <ArrowUpRight className="w-5 mb-3 h-auto" /></Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="p-6 py-4 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-[delayed-fade-in_0.7s_ease_forwards]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="opacity-80 w-4 h-auto" />
                <p className="opacity-80">Don&apos;t see your bridged asset?</p>
                <Button variant="outline" className="ml-auto" asChild><Link href="/bridge/assets" target="_blank">Add to Wallet</Link></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 bg-background flex gap-2 font-light rounded-md animate-[delayed-fade-in_0.7s_ease_forwards]">
            <Loader className="w-4 shrink-0 h-auto animate-spin" />
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="animate-pulse">Waiting for transaction to be included in a block...</p>
            </div>
          </div>
        )
      }
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
      <div className="p-6 my-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="font-extralight opacity-80 mb-4">Transaction ID</p>
        <p className="text-xl font-light">{txId}</p>
      </div>
      <div className="p-6 bg-background flex gap-2 font-light rounded-md animate-[delayed-fade-in_0.4s_ease_forwards]">
        <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="font-extralight opacity-80 mb-4">Transaction Confirmed</p>
          <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" asChild>
            <Link href={`${destinationChain.explorerUrl}/tx/${txId}`} target="_blank">View on Explorer <ArrowUpRight className="w-5 mb-3 ml-0.5 h-auto" /></Link>
          </Button>
        </div>
      </div>
      <div className="p-6 py-4 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-[delayed-fade-in_0.7s_ease_forwards]">
        <div className="flex items-center gap-2">
          <TriangleAlert className="opacity-80 w-4 h-auto" />
          <p className="opacity-80">Don&apos;t see your bridged asset?</p>
          {chainId ? <AddERCTokenButton tokenAddress={destinationAddr} tokenChainId={chainId} /> : <Button variant="ghost" className="ml-auto" asChild><Link href={`/bridge/assets?addAssets=${destinationAddr}`} target="_blank">+ Add to Wallet</Link></Button>}
        </div>
      </div>
    </div>
  )
}
