"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { NETWORKS, Network } from "../config";
import { useEffect, useState } from "react";
import { initializeBLS } from "clvm";
import { findLatestPortalState } from "@/app/bridge/util/portal_receiver";
import { WindToy } from "react-svg-spinners";
import { getSigs, stringToHex } from "@/app/bridge/util/sig";
import { getCoinRecordByName, getPuzzleAndSolution, pushTx } from "@/app/bridge/util/rpc";
import { mintCATs, sbToString } from "@/app/bridge/util/driver";
import Link from "next/link";
import { getStepThreeURL } from "./urls";

export default function StepThree({
  sourceChain,
  destinationChain,
}: {
  sourceChain: Network,
  destinationChain: Network,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`;
  const source = searchParams.get("from")!;
  const destination = searchParams.get("to")!;
  const contents = JSON.parse(searchParams.get("contents")!);

  const erc20ContractAddress = contents[0];
  const receiverPhOnChia = contents[1];
  const amount = parseInt(contents[2], 16);
  
  const offer: string | null = searchParams.get("offer");

  const [blsInitialized, setBlsInitialized] = useState(false);
  const [lastPortalInfo, setLastPortalInfo] = useState<any>(null);
  const [sigs, setSigs] = useState<string[]>([]);

  const destTxId = searchParams.get("tx");

  useEffect(() => {
    if(
      offer !== null && destTxId === null
    ) {
      if(!blsInitialized) {
        initializeBLS().then(() => {
          console.log("BLS initialized.");
          setBlsInitialized(true)
        });
        return;
      }

      if(lastPortalInfo === null) {
        findLatestPortalState(destinationChain.rpcUrl).then((
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
          sourceChain.erc20BridgeAddress!
        );

        const pushTxResp = await pushTx(destinationChain.rpcUrl, sb);
        if(!pushTxResp.success) {
          alert("Failed to push transaction - please check console for more details.");
          console.error(pushTxResp);
        } else {
          router.push(getStepThreeURL({
            sourceNetworkId: sourceChain.id,
            destinationNetworkId: destinationChain.id,
            nonce: nonce,
            source,
            destination,
            contents,
            destTransactionId: txId
          }));
        }
      }
      buildAndSubmitTx();
      return;
    }
  }, [
    offer, sigs, destinationChain.signatureThreshold, blsInitialized, setBlsInitialized, lastPortalInfo, setLastPortalInfo, destTxId,
    sourceChain.id, destinationChain.id, nonce, receiverPhOnChia, sourceChain.erc20BridgeAddress, contents, destinationChain.rpcUrl,
    destination, router, searchParams, source
  ]);

  if(offer == null) {
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

  if(destTxId === null) {
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
  }

  return (
    <FinalTxConfirmer destinationChain={destinationChain} txId={destTxId!} />
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

function FinalTxConfirmer({
  destinationChain,
  txId,
}: {
  destinationChain: Network,
  txId: string
}) {
  const [includedInBlock, setIncludedInBlock] = useState(false);

  useEffect(() => {
    const checkTxIncluded = async () => {
      while(true) {
        const coinRecord = await getCoinRecordByName(destinationChain.rpcUrl, txId);
        if(coinRecord?.spent) {
          setIncludedInBlock(true);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    checkTxIncluded();
  }, [txId, destinationChain.rpcUrl]);

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
