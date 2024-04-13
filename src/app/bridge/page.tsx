import { useSearchParams } from "next/navigation";
import StepZero from "./steps/step_zero";
import { NETWORKS, TOKENS } from "./config";

export default function BridgeInterface() {
  const searchParams = useSearchParams();

  const step = searchParams.get("step");
  const sourceChain = NETWORKS.find((network) => network.id === searchParams.get("source"));
  const destinationChain = NETWORKS.find((network) => network.id === searchParams.get("destination"));
  const token = TOKENS.find((token) => token.symbol === searchParams.get("token"));

  if(!step || !sourceChain || !destinationChain || !token) {
    return <StepZero />;
  }

  


}
