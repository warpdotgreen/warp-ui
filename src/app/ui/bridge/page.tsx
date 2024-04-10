"use client";

import { useSearchParams } from "next/navigation";
import { ChiaWalletContext } from "../chia_wallet_context";
import { MultiStepForm } from "./MultiStepForm";

export default function BridgingFirstStep() {
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step")!);

  const sourceChain = "Base";
  const destinationChain = "Chia";

  return (
    <ChiaWalletContext.Consumer>
      {(chiaWalletContext) => {
        return (
          <MultiStepForm
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            activeStep={step}
            >
              <p>Hello, sir!</p>
          </MultiStepForm>
        );
      }}
    </ChiaWalletContext.Consumer>
  );
}
