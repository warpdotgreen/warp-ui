import { NetworkType, type Network } from "./config"

export function MultiStepForm({
  sourceChain,
  destinationChain,
  activeStep,
  children,
}: {
  sourceChain: Network,
  destinationChain: Network,
  activeStep: number,
  children: React.ReactNode,
}) {
  const steps = [
    { text: `Send tokens on ${sourceChain.displayName}`, iconText: "" },
    { text: "Wait for transaction confirmation", iconText: "~15 min" },
    { text: `Claim tokens on ${destinationChain.displayName}`, iconText: "" },
  ]

  return (
    <div className="max-w-xl flex flex-col justify-center mx-auto w-full break-words grow">
      <div className="rounded-lg p-6 ">
        {steps.map((step, index) => {
          return (
            <>
              {index === 0 && (
                <p className="bg-accent rounded-sm p-6 mb-4 font-light border text-center">
                  {sourceChain.type == NetworkType.EVM ? '' : 'milli'}Ether automatically converts to {destinationChain.type == NetworkType.EVM ? 'ETH' : 'milliETH'} at a {sourceChain.type == NetworkType.EVM ? '1:1000' : '1000:1'} ratio.
                </p>
              )}
              <div key={index} className={`w-full rounded-lg p-2 border bg-accent ${activeStep - 1 == index ? '' : 'opacity-50 mt-4'}`}>
                <div className="flex justify-between items-center p-4">
                  <p className="text-2xl">{index + 1}. {step.text}</p>
                  <p className="px-2 rounded-full bg-theme-purple font-light">{step.iconText}</p>
                </div>
                <div>
                  {activeStep - 1 == index && (
                    <>{children}</>
                  )}
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}