"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {  Network, NetworkType } from "../config";
import { useEffect, useState } from "react";
import { initializeBLS } from "clvm";
import { findLatestPortalState } from "@/app/bridge/util/portal_receiver";
import { WindToy } from "react-svg-spinners";
import { decodeSignature, getSigs, stringToHex } from "@/app/bridge/util/sig";
import { getCoinRecordByName, getPuzzleAndSolution, pushTx } from "@/app/bridge/util/rpc";
import { mintCATs } from "@/app/bridge/util/driver";
import Link from "next/link";
import { getStepThreeURL } from "./urls";
import { useQuery } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { BRIDGE_CONTRACT_ABI, PortalABI } from "../util/abis";

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
  const contents = JSON.parse(searchParams.get("contents")!);
  const [waitingForTx, setWaitingForTx] = useState(false);
  const { data: hash, writeContract } = useWriteContract();

  const [sigs, setSigs] = useState<string[]>([]);
  const { data } = useQuery({
    queryKey: ['StepThree_fetchSigs', nonce],
    queryFn: () => getSigs(
      stringToHex(sourceChain.id), stringToHex(destinationChain.id), nonce, null
    ).then((sigs) => {
      setSigs(sigs);
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

  const destTxId = searchParams.get("tx");

  useEffect(() => {
    if(
      offer !== null && destTxId === null
    ) {
      const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`;
      const source = searchParams.get("source")!;
      const destination = searchParams.get("destination")!;
      const contents = JSON.parse(searchParams.get("contents")!);

      const erc20ContractAddress = contents[0];
      const receiverPhOnChia = contents[1];
      const amount = parseInt(contents[2], 16);

      if(!blsInitialized) {
        initializeBLS().then(() => {
          console.log("BLS initialized.");
          setBlsInitialized(true)
        });
        return;
      }

      if(lastPortalInfo === null) {
        findLatestPortalState(destinationChain.rpcUrl, destinationChain.portalLauncherId!).then((
          { coinId, nonces, lastUsedChainAndNonces }
        ) => {
          console.log({ msg: 'portal synced', coinId, nonces, lastUsedChainAndNonces });
          setLastPortalInfo({ coinId, nonces, lastUsedChainAndNonces });
        });
        return;
      }

      if(sigs.length < destinationChain.signatureThreshold) {
        const { coinId } = lastPortalInfo;
        const fetchSigsUntilThreshold = async () => {
          while(true) {
            const sigs = await getSigs(
              stringToHex(sourceChain.id),
              stringToHex(destinationChain.id),
              nonce,
              coinId
            );
            setSigs(sigs);

            if(sigs.length >= destinationChain.signatureThreshold) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }

        fetchSigsUntilThreshold();
        return;
      }

      // all data available, build the tx!
      const buildAndSubmitTx = async () => {
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
        const { sb, txId} = mintCATs(
          messageData,
          portalCoinRecord,
          portalParentSpend,
          nonces,
          lastUsedChainAndNonces,
          offer,
          sigs,
          [true, false, false], // todo
          stringToHex(sourceChain.id),
          sourceChain.erc20BridgeAddress!,
          destinationChain.portalLauncherId!,
          destinationChain.bridgingPuzzleHash!,
        );

        const pushTxResp = await pushTx(destinationChain.rpcUrl, sb);
        if(!pushTxResp.success) {
          alert("Failed to push transaction - please check console for more details.");
          console.error(pushTxResp);
        } else {
          router.push(getStepThreeURL({
            sourceNetworkId: sourceChain.id,
            destinationNetworkId: destinationChain.id,
            destTransactionId: txId
          }));
        }
      }
      buildAndSubmitTx();
      return;
    }
  }, [
    offer, sigs, destinationChain, blsInitialized, setBlsInitialized, lastPortalInfo, setLastPortalInfo, destTxId,
    sourceChain.id, destinationChain.id, sourceChain.erc20BridgeAddress, destinationChain.rpcUrl, router, searchParams
  ]);

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
              <p>Transaction confirmed.</p>
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
