"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {  Network, NetworkType, TOKENS } from "../config";
import {  useState } from "react";
import { initializeBLS } from "clvm";
import { findLatestPortalState } from "@/app/bridge/util/portal_receiver";
import { WindToy } from "react-svg-spinners";
import { decodeSignature, getSigsAndSelectors, stringToHex } from "@/app/bridge/util/sig";
import { getCoinRecordByName, getPuzzleAndSolution, pushTx } from "@/app/bridge/util/rpc";
import { mintCATs, sbToJSON, unlockCATs } from "@/app/bridge/util/driver";
import Link from "next/link";
import { getStepThreeURL } from "./urls";
import { useQuery } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { PortalABI } from "../util/abis";

export default function StepThree({
  sourceChain,
  destinationChain,
} : {
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

function getSigStringFromSigs(sigs: string[]): `0x${string}` {
  // todo: multi-validator support
  let sigsSoFar = "";
  for(const sig of sigs) {
    const [originChain, destinationChain, nonce, coinId, sigData] = decodeSignature(sig);
    sigsSoFar += sigData;
  }
  return ("0x" + sigsSoFar) as `0x${string}`;
}

function StepThreeEVMDestination({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const searchParams = useSearchParams();
  const nonce = searchParams.get("nonce")!;
  const source = searchParams.get("source")!;
  const destination = searchParams.get("destination")! as `0x${string}`;
  const contents = JSON.parse(searchParams.get("contents")!).map((c: string) => `0x${c}`) as `0x${string}`[];
  const [waitingForTx, setWaitingForTx] = useState(false);
  const { data: hash, writeContract } = useWriteContract();

  const [sigs, setSigs] = useState<string[]>([]);
  useQuery({
    queryKey: ['StepThree_fetchSigsAndSelectors', nonce],
    queryFn: () => getSigsAndSelectors(
      stringToHex(sourceChain.id), stringToHex(destinationChain.id), nonce, null
    ).then((sigsAndSelectors) => {
      setSigs(sigsAndSelectors[0]);
      return 1;
    }),
    enabled: hash !== undefined || sigs.length < destinationChain.signatureThreshold,
    refetchInterval: 5000,
  });

  if(hash) {
    return (
      <FinalEVMTxConfirmer destinationChain={destinationChain} txId={hash} />
    );
  }

  if(sigs.length < destinationChain.signatureThreshold) {
    return (
      <div className="text-zinc-300 flex font-medium text-md items-center justify-center">
        <div className="flex items-center">
          <WindToy color="rgb(212 212 216)" />
          <p className="pl-2"> {
             `Collecting signatures (${sigs?.length ?? 0}/${destinationChain.signatureThreshold})`
          } </p>
        </div>
      </div>)
  }

  const generateTxPls = async () => {
    setWaitingForTx(true);

    console.log({
      nonce: ("0x" + nonce),
      src_chain: ("0x" + stringToHex(sourceChain.id)),
      source: ("0x" + source),
      destination,
      contents,
      sisig: getSigStringFromSigs(sigs)
    })
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
        getSigStringFromSigs(sigs)
      ],
      chainId: destinationChain.chainId
    });
  }

  return (
    <div className="text-zinc-300"> 
      <p className="pb-6">
        Please use the button below to generate an offer that will be used to receive your assets on {destinationChain.displayName}.
        Note that using a low fee will result in longer confirmation times.  
      </p>
      <div className="flex">
        {!waitingForTx ? (
            <button
              className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
              onClick={generateTxPls}  
            >
              Generate Transaction
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
    </div>
  );
}


function StepThreeCoinsetDestination({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const offer: string | null = searchParams.get("offer");

  const [blsInitialized, setBlsInitialized] = useState(false);
  const [lastPortalInfo, setLastPortalInfo] = useState<any>(null);
  const [sigs, setSigs] = useState<string[]>([]);
  const [selectors, setSelectors] = useState<boolean[]>([]);

  const nonce: `0x${string}` = (searchParams.get("nonce") ?? "0x") as `0x${string}`;
  const source = searchParams.get("source") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const contents = JSON.parse(searchParams.get("contents") ?? "[]");

  // const isCAT = contents.length == 2;

  // const erc20ContractAddress = contents.length > 0 ? contents[0] : "";
  // const receiverPhOnChia = contents.length > 0 ? contents[1] : "";
  // const amount = parseInt(contents.length > 0 ? contents[2] : "0", 16);

  const destTxId = searchParams.get("tx");

  useQuery({
    queryKey: ['StepThree_initializeBLS'],
    queryFn: () => initializeBLS().then(() => {
      setBlsInitialized(true);
      return 1;
    }),
    enabled: offer !== null && destTxId === null && !blsInitialized,
    refetchInterval: 10000,
  });
  useQuery({
    queryKey: ['StepThree_initializeBLS'],
    queryFn: () => initializeBLS().then(() => {
      setBlsInitialized(true);
      return 1;
    }),
    enabled: offer !== null && destTxId === null && !blsInitialized,
    refetchInterval: 10000,
  });
  useQuery({
    queryKey: ['StepThree_findLatestPortalState'],
    queryFn: () => findLatestPortalState(destinationChain.rpcUrl, destinationChain.portalLauncherId!).then((
      { coinId, nonces, lastUsedChainAndNonces }
    ) => {
      console.log({ msg: 'portal synced', coinId, nonces, lastUsedChainAndNonces });
      setLastPortalInfo({ coinId, nonces, lastUsedChainAndNonces });
      return 1;
    }),
    enabled: offer !== null && destTxId === null && lastPortalInfo === null && blsInitialized,
  });
  useQuery({
    queryKey: ['StepThree_getSigsAndSelectors'],
    queryFn: () => getSigsAndSelectors(
      stringToHex(sourceChain.id),
      stringToHex(destinationChain.id),
      nonce,
      lastPortalInfo.coinId!
    ).then((sigsAndSelectors) => {
      setSigs(sigsAndSelectors[0]);
      setSelectors(sigsAndSelectors[1]);
      return 1;
    }),
    enabled: lastPortalInfo?.coinId && offer !== null && destTxId === null && sigs.length < destinationChain.signatureThreshold,
    refetchInterval: 5000,
  });
  useQuery({
    queryKey: ['StepThree_buildAndSubmitTx'],
    queryFn: async () => {
      const { coinId, nonces, lastUsedChainAndNonces } = lastPortalInfo;
      const portalCoinRecord = await getCoinRecordByName(
        destinationChain.rpcUrl,
        coinId
      );
      const portalParentSpend = await getPuzzleAndSolution(
        destinationChain.rpcUrl,
        portalCoinRecord.coin.parent_coin_info,
        portalCoinRecord.confirmed_block_index
      );

      const messageData = {
        nonce,
        destination,
        contents
      }

      var sb, txId;
      if(contents.length === 3) { // wrapped ERC20s
        ({ sb, txId } = mintCATs(
          messageData,
          portalCoinRecord,
          portalParentSpend,
          nonces,
          lastUsedChainAndNonces,
          offer!,
          sigs,
          selectors,
          stringToHex(sourceChain.id),
          sourceChain.erc20BridgeAddress!,
          destinationChain.portalLauncherId!,
        ));
      } else { // native CATs being unwrapped
        // find asset id via bruteforce
        var assetId = "00".repeat(32);
        TOKENS.forEach((token) => {
          token.supported.forEach((tokenInfo) => {
            if(tokenInfo.contractAddress === source) {
              assetId = tokenInfo.assetId;
            }
          });
        });

        ({ sb, txId} = unlockCATs(
          messageData,
          portalCoinRecord,
          portalParentSpend,
          nonces,
          lastUsedChainAndNonces,
          offer!,
          sigs,
          selectors,
          stringToHex(sourceChain.id),
          source,
          destinationChain.portalLauncherId!,
          lockedCoinsAndProofs[0],
          lockedCoinAndProofs[1],
          destinationChain.aggSigData!,
          assetId === "32".repeat(32) ? null : assetId
        ));
      }

      const pushTxResp = await pushTx(destinationChain.rpcUrl, sb);
      if(!pushTxResp.success) {
        const sbJson = sbToJSON(sb);
        await navigator.clipboard.writeText(JSON.stringify(sbJson, null, 2));
        alert("Failed to push transaction - please check console for more details.");
        console.error(pushTxResp);
      } else {
        router.push(getStepThreeURL({
          sourceNetworkId: sourceChain.id,
          destinationNetworkId: destinationChain.id,
          destTransactionId: txId
        }));
      }

      return 1;
    },
    enabled: offer !== null && destTxId === null && sigs.length >= destinationChain.signatureThreshold,
  });

  if(!offer && !destTxId) {
    const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`;
    const source = searchParams.get("source")!;
    const destination = searchParams.get("destination")!;
    const contents = JSON.parse(searchParams.get("contents")!);
    const amount = parseInt(contents[2], 16);

    return (
      <GenerateOfferPrompt
        destinationChain={destinationChain}
        amount={amount}
        onOfferGenerated={(offer) => {
          router.push(getStepThreeURL({
            sourceNetworkId: sourceChain.id,
            destinationNetworkId: destinationChain.id,
            nonce,
            source,
            destination,
            contents,
            offer,
          }));
        }}
      />
    );
  }

  if(!destTxId) {
    return (
      <div className="text-zinc-300 flex font-medium text-md items-center justify-center">
        <div className="flex items-center">
          <WindToy color="rgb(212 212 216)" />
          <p className="pl-2"> {
            blsInitialized ? (
              lastPortalInfo !== null ? (
                sigs.length >= destinationChain.signatureThreshold ? (
                  "Building transaction..."
                ) : (
                  `Collecting signatures (${sigs.length}/${destinationChain.signatureThreshold})`
                )
              ) : "Syncing portal..."
            ) : "Initializing BLS..."
          } </p>
        </div>
      </div>
    );
  }

  return (
    <FinalCoinsetTxConfirmer destinationChain={destinationChain} txId={destTxId!} />
  );
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
  const [waitingForTx, setWaitingForTx] = useState(false);

  const generateOfferPls = async () => {
    setWaitingForTx(true);
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
      const response = await (window as any).chia.request({ method: 'createOffer', params })
      if (response.offer) {
        onOfferGenerated(response.offer);
      }
    } catch(e) {
      console.error(e);
    }
    setWaitingForTx(false);
  }

  return (
    <div className="text-zinc-300"> 
      <p className="pb-6">
        Please use the button below to generate an offer that will be used to mint the wrapped assets on {destinationChain.displayName}.
        Note that using a low fee will result in longer confirmation times.  
      </p>
      <div className="flex">
        {!waitingForTx ? (
            <button
              className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
              onClick={generateOfferPls}  
            >
              Generate Offer
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
    </div>
  );
}

function FinalCoinsetTxConfirmer({
  destinationChain,
  txId,
}: {
  destinationChain: Network,
  txId: string
}) {
  const [coinRecord, setCoinRecord] = useState<any>(null);
  const includedInBlock = coinRecord?.spent === true;

  const { data } = useQuery({
    queryKey: ['StepThree_getCoinRecordByName', txId],
    queryFn: () => getCoinRecordByName(destinationChain.rpcUrl, txId).then((res) => {
      setCoinRecord(res);
      return 1;
    }),
    enabled: !includedInBlock,
    refetchInterval: 5000,
  });

  return <>
    Transaction id: {txId}
    <div className="pt-8 text-zinc-300 flex font-medium text-md items-center justify-center">
      <div className="flex items-center">
        {
          includedInBlock ? (
            <>
              <p>Transaction sent.</p>
              <Link href={`${destinationChain.explorerUrl}/coin/0x${txId}`} target="_blank" className="pl-2 underline text-green-500 hover:text-green-300">Verify on SpaceScan.</Link>
            </>
          ) : (
            <>
              <WindToy color="rgb(212 212 216)" />
              <p className="pl-2">
                Waiting for transaction to be included in a block...
              </p>
            </>
          )
        }
      </div>
    </div>
  </>
}

function FinalEVMTxConfirmer({
  destinationChain,
  txId,
}: {
  destinationChain: Network,
  txId: string
}) {
  return <>
    Transaction id: {txId}
    <div className="pt-8 text-zinc-300 flex font-medium text-md items-center justify-center">
      <div className="flex items-center">
        <p>Transaction confirmed.</p>
        <Link href={`${destinationChain.explorerUrl}/tx/${txId}`} target="_blank" className="pl-2 underline text-green-500 hover:text-green-300">View on explorer.</Link>
      </div>
    </div>
  </>
}
