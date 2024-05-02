"use client";

import { useSearchParams } from "next/navigation";
import StepZero from "./steps/StepZero";
import { NETWORKS } from "./config";
import { MultiStepForm } from "./MultiStepForm";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";

export default function BridgeInterface() {
  const searchParams = useSearchParams();

  const step = searchParams.get("step");
  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("from"));
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("to"));

  if(!step || !sourceChain || !destinationChain || !["1", "2", "3"].includes(step)) {
    return <StepZero />;
  }

  
  return (
    <MultiStepForm
      activeStep={parseInt(step)}
      sourceChainName={sourceChain.displayName}
      destinationChainName={destinationChain.displayName}
    >
      {step === "1" && (<StepOne sourceChain={sourceChain} destinationChain={destinationChain} />)}
      {step === "2" && (<StepTwo sourceChain={sourceChain} destinationChain={destinationChain} />)}
      {step === "3" && (<StepThree sourceChain={sourceChain} destinationChain={destinationChain} />)}
    </MultiStepForm>
  );

}
