"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChiaWalletContext } from "../chia_wallet_context";
import { MultiStepForm } from "./../MultiStepForm";
import { NETWORKS, NetworkType, TOKENS } from "../config";
import { ethers } from "ethers";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BRIDGE_CONTRACT_ABI } from "@/util/bridge";
import * as GreenWeb from 'greenwebjs';
import { useEffect, useState } from "react";

export default function BridgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"))!;
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"))!;
  const tx_hash = searchParams.get("tx_hash")!;


  return (
    <MultiStepForm
    sourceChainName={sourceChain.displayName}
    destinationChainName={destinationChain.displayName}
    activeStep={2}
    >
      {tx_hash}
    </MultiStepForm>
  );
}
