"use client";

import { ChiaWalletContext } from "../chia_wallet_context";
import { MultiStepForm } from "./MultiStepForm";

export default function BridgingFirstStep() {

  const sourceChain = "Base";
  const destinationChain = "Chia";

  return (
    <ChiaWalletContext.Consumer>
      {(chiaWalletContext) => {
        return (
          <MultiStepForm
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            activeStep={1}
            >
              <p>Hello, sir!</p>
          </MultiStepForm>
        );
      }}
    </ChiaWalletContext.Consumer>
  );
}
