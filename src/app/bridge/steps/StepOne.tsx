"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Network, NetworkType, Token, TOKENS, wagmiConfig } from "../config"
import { ethers } from "ethers"
import { useAccount, useReadContract, useTransactionConfirmations, useWriteContract, useChainId, useConfig, useSwitchChain, useBalance, useReadContracts } from "wagmi"
import * as GreenWeb from 'greenwebjs'
import { useEffect, useState } from "react"
import { getStepOneURL, getStepTwoURL } from "./urls"
import { USDTABI, erc20ABI, ERC20BridgeABI, WrappedCATABI } from "../drivers/abis"
import { burnCATs } from "../drivers/erc20bridge"
import { lockCATs } from "../drivers/catbridge"
import { pushTx, sbToJSON } from "../drivers/rpc"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useWallet } from "../ChiaWalletManager/WalletContext"
import { BaseIcon, ChiaIcon, ETHIcon } from "../components/Icons/ChainIcons"
import { cn, withToolTip } from "@/lib/utils"
import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import { erc20Abi } from "viem"
import OrPasteOffer from "./OrOffer"
import Link from "next/link"

export default function StepOne({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter()

  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')!
  const amount = searchParams.get('amount') ?? ""

  if(recipient.includes("00".repeat(20))){
    toast.error("Invalid recipient address", { description: "Please reconnect your Ethereum wallet.", duration: 7000, id: "invalid-recipient" })
    router.push("/bridge")
    return <></>
  }

  const token: Token = TOKENS.find((token) => token.symbol === searchParams.get("token"))!

  var decimals = 3
  if (token.symbol === "ETH" && sourceChain.type == NetworkType.EVM) {
    decimals = 6
  }
  if (token.symbol === "XCH") {
    decimals = 12
  }

  var amountMojo: bigint
  try {
    amountMojo = ethers.parseUnits(amount, decimals)
  } catch (_) {
    toast.error("Invalid amount", { description: "3 decimal places allowed for any token, except for ETH (6 decimal places) and XCH (12 decimal places)", duration: 10000, id: "invalid-amount" })
    router.push("/bridge")
    return <></>
  }

  let outputAmountStr = "";
  if(token.sourceNetworkType === NetworkType.EVM) {
    if(destinationChain.type === NetworkType.COINSET) {
      // EVM token warped to Chia
      let feeMojo = amountMojo * BigInt(30) / BigInt(10000);
      if(feeMojo < BigInt(1)) {
        feeMojo = BigInt(1);
      }
      const amountMojoAfterFee = amountMojo - feeMojo;

      if(amountMojoAfterFee < BigInt(1)) {
        toast.error("Amount too low", { description: "Your bridging amount is too low. The minimum total amount is 2 mojos - one for fees, and one to be transferred to the recipient.", duration: 10000, id: "amount-too-low" })
        router.push("/bridge")
        return <></>
      }

      outputAmountStr = ethers.formatUnits(amountMojoAfterFee, decimals);
      if(token.symbol === "ETH") {
        outputAmountStr = ethers.formatUnits(amountMojoAfterFee, decimals - 3);
      }
    } else {
      // EVM token returning to origin chain
      const ethSideDecimals = token.symbol == "ETH" ? 3 : 6;
      let amountWei = ethers.parseUnits(amount, ethSideDecimals);
      
      let feeWei = amountWei * BigInt(30) / BigInt(10000);
      if(feeWei < 1) {
        feeWei = BigInt(1);
      }

      if(feeWei < 1 || amountWei - feeWei < 1) {
        toast.error("Amount too low", { description: "Your bridging amount is too low.", duration: 10000, id: "amount-too-low" })
        router.push("/bridge")
        return <></>
      }

      outputAmountStr = ethers.formatUnits(amountWei - feeWei, token.symbol == "ETH" ? 6 : ethSideDecimals);
    }
  } else {
    // Chia token returning to origin chain or EVM token briged to Chia
    let feeMojo = amountMojo * BigInt(30) / BigInt(10000);
    if(feeMojo < BigInt(1)) {
      feeMojo = BigInt(1);
    }
    const amountMojoAfterFee = amountMojo - feeMojo;

    if(amountMojoAfterFee < BigInt(1)) {
      toast.error("Amount too low", { description: "Your bridging amount is too low. The minimum total amount is 2 mojos - one for fees, and one to be transferred to the recipient.", duration: 10000, id: "amount-too-low" })
      router.push("/bridge")
      return <></>
    }

    outputAmountStr = ethers.formatUnits(amountMojoAfterFee, decimals);
    if(token.symbol === "ETH") {
      outputAmountStr = ethers.formatUnits(amountMojoAfterFee, decimals + 3);
    }
  }

  const chainIcons = (() => {
    let sourceChainIcon = <></>
    let destinationChainIcon = <></>

    switch (sourceChain.displayName) {
      case "Base":
        sourceChainIcon = <BaseIcon className="w-6 h-auto shrink-0" />
        break
      case "Chia":
        sourceChainIcon = <ChiaIcon className="w-6 h-auto shrink-0 object-scale-down" />
        break
      case "Ethereum":
        sourceChainIcon = <ETHIcon className="w-6 h-auto shrink-0" />
        break
      default:
        break
    }
    switch (destinationChain.displayName) {
      case "Base":
        destinationChainIcon = <BaseIcon className="w-6 h-auto shrink-0" />
        break
      case "Chia":
        destinationChainIcon = <ChiaIcon className="w-6 h-auto shrink-0 object-scale-down" />
        break
      case "Ethereum":
        destinationChainIcon = <ETHIcon className="w-6 h-auto shrink-0" />
        break
      default:
        break
    }
    return {
      sourceChainIcon: withToolTip(sourceChainIcon, sourceChain.displayName),
      destinationChainIcon: withToolTip(destinationChainIcon, destinationChain.displayName)
    }
  })()

  return (
    <>
      {sourceChain.id === 'xch' && destinationChain.id === 'bse' && token.symbol === 'XCH' && <div className="px-2 mb-4 text-white p-2 rounded-md text-center">
        Selling XCH? Compare different routes at <Link href="https://xchprice.info/?direction=sell" target="_blank" rel="noopener noreferrer" className="text-green-500 font-semibold underline hover:opacity-80">xchprice.info</Link>. <br/>
        (not affiliated with warp.green - we just thought it&apos;d be useful)
      </div>}

      <p className="px-4">Confirm the details below and ensure you have sufficient assets for one transaction on both networks.</p>

      <div className="p-6 mt-6 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="mb-2 font-extralight opacity-80">Sending</p>
        <ArrowRight />
        <div className="flex gap-4">
          {chainIcons.sourceChainIcon}
          <p className="text-xl flex items-center gap-2">{amount} {sourceChain.type !== token.sourceNetworkType && `${destinationChain.displayName} Warped`} {token.symbol === "ETH" && sourceChain.type == NetworkType.COINSET ? <>milliETH {withToolTip(<div className="group-hover:opacity-80 h-5 flex justify-center items-center shadow-sm shadow-white/50 border rounded-full aspect-square bg-accent text-sm font-normal text-primary/80 w-auto">?</div>, 'milliEther is automatically converted to ETH at a 1000:1 ratio.')}</> : token.symbol}</p>
        </div>

        <div className="flex gap-4">
          {chainIcons.sourceChainIcon}
          <p className="text-xl">{ethers.formatUnits(sourceChain.messageToll, sourceChain.type == NetworkType.EVM ? 18 : 12)}
            {sourceChain.type == NetworkType.EVM ? ' ETH ' : ' XCH '}
            <span className="bg-theme-purple rounded-full px-3 ml-2">Toll</span>
          </p>
        </div>
      </div>

      <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="mb-2 font-extralight opacity-80">Receiving (after 0.3% protocol tip)</p>
        <ArrowLeft />

        <div className="flex gap-4">
          {chainIcons.destinationChainIcon}
          {sourceChain.type == NetworkType.COINSET && token.symbol == "ETH" ? (
            <p className="text-xl">{outputAmountStr} ETH</p>
          ) : (
            token.symbol == "XCH" ? (
              <p className="text-xl">{outputAmountStr} {token.sourceNetworkType !== destinationChain.type ? `${sourceChain.displayName} Warped` : ''} XCH</p>
            ) : (
              <p className="text-xl flex items-center gap-2">{outputAmountStr} {token.symbol === "ETH" ?
                <>{sourceChain.displayName} Warped milliETH {withToolTip(<div className="group-hover:opacity-80 h-5 flex justify-center items-center shadow-sm shadow-white/50 border rounded-full aspect-square bg-accent text-sm font-normal text-primary/80 w-auto">?</div>, 'Ether is automatically converted to milliETH at a 1:1000 ratio.')}</> :
                `${token.sourceNetworkType !== destinationChain.type ? `${sourceChain.displayName} Warped` : ''} ${token.symbol}`}</p>
            )
          )
          }
        </div>
      </div>


      <div className="p-6 mt-2 bg-background flex flex-col gap-2 font-light rounded-md relative animate-[delayed-fade-in_0.7s_ease_forwards]">
        <p className="mb-2 font-extralight opacity-80">Recipient address</p>
        <p className="text-xl mb-4">{recipient}</p>
        <div className="w-full">
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
      </div>

    </>
  )
}

function EthereumButton({
  token,
  sourceChain,
  destinationChain,
  recipient,
  amount,
  amountMojo
}: {
  token: Token,
  sourceChain: Network,
  destinationChain: Network,
  recipient: string,
  amount: string,
  amountMojo: bigint
}) {
  const tokenInfo = token.supported.find((supported) => supported.evmNetworkId === sourceChain.id)!

  const router = useRouter()
  const account = useAccount()
  const [waitingForTx, setWaitingForTx] = useState(false)

  // allowance stuff
  const { data: tokenDecimalsFromContract } = useReadContract({
    address: tokenInfo.contractAddress,
    abi: erc20ABI,
    functionName: "decimals",
    args: [],
  })
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenInfo.contractAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      account.address!, sourceChain.erc20BridgeAddress!
    ],
  })
  const approvedEnough = token.symbol === 'ETH' || token.sourceNetworkType == NetworkType.COINSET || (
    allowance && tokenDecimalsFromContract && allowance >= ethers.parseUnits(amount, tokenDecimalsFromContract)
  )

  const { data: approvalTxHash, writeContract: writeContractForApproval } = useWriteContract()

  const { data: approvalTxConfirmations } = useTransactionConfirmations({
    hash: approvalTxHash,
    query: {
      enabled: approvalTxHash !== undefined && !approvedEnough,
      refetchInterval: 1000,
    }
  })

  useEffect(() => {
    if (approvalTxConfirmations ?? 0 > 0) {
      refetchAllowance()
    }
  }, [approvalTxConfirmations, refetchAllowance])
  // end allowance stuff

  const { data: hash, writeContract } = useWriteContract()

  useEffect(() => {
    if (hash !== undefined) {
      router.push(getStepTwoURL({
        sourceNetworkId: sourceChain.id,
        destinationNetworkId: destinationChain.id,
        txHash: hash
      }))
    }
  })

  if (waitingForTx) {
    return (
      <LoadingButton text="Waiting For Transaction Approval" />
    )
  }

  const initiateBridgingFromEVMToChia = async () => {
    const receiver = GreenWeb.util.address.addressToPuzzleHash(recipient)

    setWaitingForTx(true)

    if (token.symbol == "ETH") {
      writeContract({
        address: sourceChain.erc20BridgeAddress as `0x${string}`,
        abi: ERC20BridgeABI,
        functionName: "bridgeEtherToChia",
        args: [
          ("0x" + receiver) as `0x${string}`,
          sourceChain.messageToll
        ],
        value: ethers.parseEther(amount) + sourceChain.messageToll,
        chainId: sourceChain.chainId
      })
    } else if (token.sourceNetworkType == NetworkType.EVM) {
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
      })
    } else {
      // token.sourceNetworkType == NetworkType.COINSET
      writeContract({
        address: tokenInfo.contractAddress,
        abi: WrappedCATABI,
        functionName: "bridgeBack",
        args: [
          ("0x" + receiver) as `0x${string}`,
          amountMojo
        ],
        chainId: sourceChain.chainId,
        value: sourceChain.messageToll
      })
    }
  }

  const approveTokenSpend = async () => {
    console.log({
        amountToApprove: ethers.parseUnits(amount, tokenDecimalsFromContract ?? (token.sourceNetworkType === NetworkType.EVM ? 6 : 18)),
        addy: tokenInfo.contractAddress
    })
    writeContractForApproval({
      address: tokenInfo.contractAddress,
      abi: token.symbol === "USDT" ? USDTABI : erc20ABI,
      functionName: "approve",
      args: [
        sourceChain.erc20BridgeAddress as `0x${string}`,
        ethers.parseUnits(amount, tokenDecimalsFromContract ?? (token.sourceNetworkType === NetworkType.EVM ? 6 : 18))
      ]
    })
  }

  if (!approvedEnough) {
    if (approvalTxHash) {
      return (
        <LoadingButton text="Waiting for transaction confirmation" />
      )
    }

    return (
      <ActionButton
        onClick={approveTokenSpend}
        text="Approve token spend"
        sourceChainId={sourceChain.chainId}
        amount={amount}
        toll={ethers.formatUnits(sourceChain.messageToll, sourceChain.type == NetworkType.EVM ? 18 : 12)}
        tokenAddress={tokenInfo.contractAddress}
      />
    )
  }

  return (
    <ActionButton
      onClick={initiateBridgingFromEVMToChia}
      text="Initiate Bridging"
      sourceChainId={sourceChain.chainId}
      amount={amount}
      toll={ethers.formatUnits(sourceChain.messageToll, sourceChain.type == NetworkType.EVM ? 18 : 12)}
      tokenAddress={tokenInfo.contractAddress}
    />
  )
}

function ChiaButton({
  token,
  sourceChain,
  destinationChain,
  recipient,
  amountMojo
}: {
  token: Token,
  sourceChain: Network,
  destinationChain: Network,
  recipient: string,
  amount: string,
  amountMojo: bigint
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("")
  const { createOffer } = useWallet()

  const offer = searchParams.get('offer') ?? "";

  const tokenInfo = token.supported.find((supported) => supported.coinsetNetworkId === sourceChain.id && supported.evmNetworkId === destinationChain.id)!

  useEffect(() => {
    const doStuffWithOfferPls = async () => {
      const [sb, nonce] = await (token.sourceNetworkType == NetworkType.EVM ? burnCATs(
        offer,
        sourceChain,
        destinationChain,
        tokenInfo.contractAddress,
        recipient,
        setStatus
      ) : lockCATs(
        offer,
        destinationChain,
        sourceChain,
        tokenInfo.assetId == "00".repeat(32) ? null : tokenInfo.assetId,
        tokenInfo.contractAddress,
        recipient,
        setStatus
      ))

      if(nonce.length == 0) {
        if(offer.length > 0) {
          const retries = parseInt(window.localStorage.getItem("bls_retries") ?? "0")
          if(retries < 3) {
            window.localStorage.setItem("bls_retries", (retries + 1).toString())
            location.reload()
            return;
          } else {
            navigator.clipboard.writeText(location.href)
            alert('Failed to initialize BLS after several retries - try restarting your browser, and contact us if this issue persists. Current URL has been copied to your clipboard so you can return to it more easily.');
            window.localStorage.setItem("bls_retries", "0")
            return;
          }
        }
      }

      window.localStorage.setItem("bls_retries", "0")
      const [pushTxResp, feeError] = await pushTx(sourceChain.rpcUrl, sb);
      if (!pushTxResp.success) {
        const sbJson = sbToJSON(sb)
        await navigator.clipboard.writeText(JSON.stringify(sbJson, null, 2))
        console.error(pushTxResp)
        if (feeError) {
          toast.error("Fee too low", { description: "Your transaction includes a fee that is too low for the current mempool conditions.", duration: 20000, id: "Fee too low" })
        } else {
          toast.error("Failed to push transaction", { description: "Please check console for more details. Refresh the page to try again.", duration: 20000, id: "Failed to push transaction" })
        }
        setStatus("Failed to push tx")
        return
      } else {
        if(pushTxResp.status !== "SUCCESS") {
          alert(`Transaction push failed - you might be using a fee that is too low`)
          router.back()
          return;
        }

        router.push(getStepTwoURL({
          sourceNetworkId: sourceChain.id,
          destinationNetworkId: destinationChain.id,
          txHash: nonce,
        }))
      }
    };

    if(offer.length > 0) {
      doStuffWithOfferPls();
    }
  }, [offer, destinationChain, sourceChain, recipient, router, searchParams, token, tokenInfo])

  var offerMojoAmount = BigInt(sourceChain.messageToll)
  if (token.sourceNetworkType == NetworkType.EVM) {
    // We'll melt CAT mojos and use them as a fee as well
    offerMojoAmount -= amountMojo
  }

  // either requesting XCH (toll) + asset or just XCH (toll + asset)
  var xchAmount = parseInt(offerMojoAmount.toString())

  var offerAssets: any[] = []
  var offerReqString = "";

  if (tokenInfo.assetId === "00".repeat(32)) {
    xchAmount += parseInt(amountMojo.toString())
  } else {
    offerAssets.push({
      assetId: tokenInfo.assetId,
      amount: parseInt(amountMojo.toString())
    })
    offerReqString += `${ethers.formatUnits(amountMojo, 3)} ${token.symbol} and `;
  }

  offerAssets.push({
    assetId: "",
    amount: xchAmount
  })
  offerReqString += `${ethers.formatUnits(xchAmount, 12)} XCH`;

  const doStuffWithOffer = async (offer: string) => {
    router.push(getStepOneURL({
      sourceNetworkId: sourceChain.id,
      destinationNetworkId: destinationChain.id,
      tokenSymbol: token.symbol,
      recipient,
      amount: searchParams.get('amount') as string,
      offer
    }))
  }

  if(recipient.includes("00".repeat(20)) || recipient === undefined || recipient === null || recipient.length !== 42) {
    toast.error("Invalid recipient address", { description: "Please reconnect your Ethereum wallet.", duration: 7000, id: "invalid-recipient" })
    router.push("/bridge")
    return <></>
  }

  const initiateBridgingFromChiaToEVM = async () => {
    var offer = null

    try {
      const params = {
        offerAssets: offerAssets,
        requestAssets: [],
        fee: 2500000000,
      }
      offer = await createOffer(params)
    } catch (e) {
      console.error(e)
    }

    if (!offer) {
      setStatus("")
      return
    }

    await doStuffWithOffer(offer)
  }

  if (status.length > 0) {
    return (
      <LoadingButton text={status} />
    )
  }

  return (
    <>
      <ActionButton
        text="Initiate Bridging via Wallet"
        onClick={initiateBridgingFromChiaToEVM}
      />
      <OrPasteOffer
        requiredAssetsStr={offerReqString}
        onOfferSubmitted={doStuffWithOffer}
      />
    </>
  )
}

function ActionButton({
  text,
  onClick,
  sourceChainId,
  amount,
  toll = "0",
  tokenAddress
}: {
  text: string,
  onClick: () => Promise<void>
  sourceChainId?: number
  amount?: string
  toll?: string
  tokenAddress?: string
}) {


  const wagmiChainId = useChainId()
  const { switchChainAsync, status } = useSwitchChain({ config: wagmiConfig })
  const { address } = useAccount()
  const { open } = useWeb3Modal()
  const { walletInfo } = useWalletInfo()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') as string
  const from = searchParams.get('from') as string
  const isNativeETH = token === "ETH" && (from === "bse" || from === "eth")
  let balance

  // Fetch native ETH balance if milliETH
  const { data: userETHData } = useBalance({
    address,
    query: {
      enabled: isNativeETH,
      gcTime: 0
    }
  })
  if (userETHData) {
    balance = Number(userETHData?.value) / 10 ** userETHData?.decimals
  }

  // Fetch erc-20 token balance if not milliETH
  const { data: tokenBalanceData } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: !isNativeETH,
      gcTime: 0
    },
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ]
  })
  if (tokenBalanceData) {
    balance = Number(tokenBalanceData[0]) / 10 ** tokenBalanceData[1]
  }


  if (sourceChainId && amount && tokenAddress) {
    const switchToCorrectChain = async () => await switchChainAsync({ chainId: sourceChainId })
    const isOnRightChain = sourceChainId === wagmiChainId

    if (!walletInfo) {
      return (
        <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" onClick={() => open()}>
          Connect Wallet
        </Button>
      )
    }

    if (!isOnRightChain) {
      return (
        <Button disabled={status === "pending"} className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" onClick={switchToCorrectChain}>
          <span className={cn(status === "pending" && 'animate-pulse')}>Switch Chain</span>
        </Button>
      )
    }

    if (walletInfo?.name === "MetaMask" && amount && typeof balance === "number") {

      if ((isNativeETH && balance < (parseFloat(amount) + parseFloat(toll))) || (!isNativeETH && balance < parseFloat(amount))) {
        return (
          <Button disabled className="w-full h-14 bg-destructive text-primary hover:opacity-80 text-xl">
            Insufficient Balance
          </Button>
        )
      }
    }
  }

  return (
    <Button className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl" onClick={onClick}>{text}</Button>
  )
}

function LoadingButton({
  text
}: {
  text: string
}) {
  return (
    <Button
      className="relative flex items-center gap-2 w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
      disabled={true}
    >
      <p className="animate-pulse whitespace-normal">{text}</p>
    </Button>
  )
}

function ArrowLeft() {
  return (
    <svg className="opacity-80 w-6 h-auto absolute top-6.5 right-6" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}

function ArrowRight() {
  return (
    <svg className="opacity-80 w-6 h-auto absolute top-6.5 right-6" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}
