import { useSearchParams } from "next/navigation";
import StepZero from "./steps/step_zero";
import { NETWORKS, TOKENS } from "./config";
import { MultiStepForm } from "./MultiStepForm";
import StepOne from "./steps/step_one";
import StepTwo from "./steps/step_two";
import StepThree from "./steps/step_three";

export default function BridgeInterface() {
  const searchParams = useSearchParams();

  const step = searchParams.get("step");
  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"));
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"));
  const token = TOKENS.find((token) => token.symbol === searchParams.get("token"));

  if(!step || !sourceChain || !destinationChain || !token || !["1", "2", "3"].includes(step)) {
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
