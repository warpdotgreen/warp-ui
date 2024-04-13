"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { NETWORKS, Network, wagmiConfig } from "../config";
import { useEffect, useState } from "react";
import { useClient, useReadContract, useWatchContractEvent } from "wagmi";
import { PortalABI } from "@/util/abis";
import { getLogs } from "viem/actions";

export default function BridgePageThree() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"))!;
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"))!;
  const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`;
  const source = searchParams.get("from")!;
  const destination = searchParams.get("to")!;
  const contents = JSON.parse(searchParams.get("contents")!);

  const erc20ContractAddress = contents[0];
  const receiverPhOnChia = contents[1];
  const amount = parseInt(contents[2], 16);
  
  const offer: string | null = searchParams.get("offer");

  return (
    <MultiStepForm
    sourceChainName={sourceChain.displayName}
    destinationChainName={destinationChain.displayName}
    activeStep={3}
    >
      {offer === null ? (
        <GenerateOfferPrompt
          destinationChain={destinationChain}
          amount={amount}
          onOfferGenerated={(offer) => {
            const queryString = new URLSearchParams({
              source: sourceChain.id,
              destination: destinationChain.id,
              nonce: nonce,
              from: source,
              to: destination,
              contents: JSON.stringify(contents),
              offer: offer
            }).toString();

            router.push(`/bridge-step-3?${queryString}`);
          }}
        />
      ) : (
        <p>TODO Ser</p>
      )}
    </MultiStepForm>
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
