"use client";

import { useSearchParams } from "next/navigation";
import { ChiaWalletContext } from "../chia_wallet_context";
import { MultiStepForm } from "./MultiStepForm";
import { NETWORKS, NetworkType, TOKENS } from "../config";

export default function BridgingFirstStep() {
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
            return (
              <>
                { token.symbol === "ETH" && (
                  <div className="border italic border-zinc-500 bg-zinc-700 rounded-lg px-2 py-2">
                    Note: You{"'"}re transferring ether. You{"'"}ll send {sourceChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'}, which will be converted to {destinationChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'} at a rate of {sourceChain.type == NetworkType.EVM ? '1:1000' : '1000:1'}.
                  </div> 
                )}
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
