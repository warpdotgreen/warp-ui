"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChiaWalletContext } from "../chia_wallet_context";
import { MultiStepForm } from "./MultiStepForm";
import { NETWORKS, NetworkType, TOKENS } from "../config";
import { ethers } from "ethers";
import { BigNumber } from "greenwebjs";

export default function BridgingFirstStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step")!);

  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"))!;
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"))!;
  const token = TOKENS.find((token) => token.symbol === searchParams.get("token"))!;

  return (
    <MultiStepForm
    sourceChainName={sourceChain.displayName}
    destinationChainName={destinationChain.displayName}
    activeStep={step}
    >
      <ChiaWalletContext.Consumer>
        {(chiaWalletContext) => {
          if(step === 1 || false) {
            const recipient = searchParams.get('recipient')!;
            const amount = searchParams.get('amount') ?? "";
            
            var decimals = 3;
            if(token.symbol === "ETH") {
              decimals = 6;
            }

            var amountMojo;
            try {
              amountMojo = ethers.parseUnits(amount, decimals);
            } catch(_) {
              alert("Invalid amount - 3 decimal places allowed for any token, except for ETH, which allows 6 decimal places.");
              router.back();
              return <></>;
            }
            
            const amountMojoAfterFee = amountMojo - amountMojo * BigInt(30) / BigInt(10000);

            const initiateBrudging = async () => {
              alert("Bridging initiated!");
            }

            return (
              <>
                { token.symbol === "ETH" && (
                  <div className="border italic border-zinc-500 bg-zinc-700 rounded-lg px-4 py-2 mb-2">
                    Note: Ether will be automatically converted to {destinationChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'} at a rate of {sourceChain.type == NetworkType.EVM ? '1:1000' : '1000:1'}.
                  </div> 
                )}
                <p className="mb-4">To start, please confirm the information below.</p>
                <p className="text-zinc-500">Sending:</p>
                <p className="px-6">{amount} {token.symbol} ({sourceChain.displayName})</p>
                <p className="text-zinc-500">Receiving (after 0.3% protocol tip):</p>
                <p className="px-6">{ethers.formatUnits(amountMojoAfterFee, 3)} {token.symbol === "ETH" ? "milliETH" : token.symbol} ({destinationChain.displayName})</p>
                <p className="text-zinc-500">Recipient address:</p>
                <p className="px-6 break-words mb-4">{recipient}</p>
                <div className="flex">
                  <button
                    className="rounded-full text-zinc-100 bg-green-500 hover:bg-green-700 max-w-xs w-full px-4 py-2 font-semibold mx-auto"
                    onClick={initiateBrudging}  
                  >
                    Initiate Bridging
                  </button>
                </div>
              </>
            );
          }

          return (
            <p>Something is wrong, I can feel it.</p>
          );
        }}
      </ChiaWalletContext.Consumer>
    </MultiStepForm>
  );
}
