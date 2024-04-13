"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "./../MultiStepForm";
import { Network, NETWORKS } from "../config";
import { useBlockNumber, useWaitForTransactionReceipt } from "wagmi";
import { WindToy } from "react-svg-spinners";
import { useEffect } from "react";
import { ethers } from "ethers";

export default function BridgePageThree() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"))!;
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"))!;
  const nonce: `0x${string}` = searchParams.get("nonce")! as `0x${string}`;

  return (
    <MultiStepForm
    sourceChainName={sourceChain.displayName}
    destinationChainName={destinationChain.displayName}
    activeStep={3}
    >
      <p>Nonce: {nonce}</p>
    </MultiStepForm>
  );
}
