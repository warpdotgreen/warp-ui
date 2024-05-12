import { Button } from "@/components/ui/button"
import { NetworkType, type Network } from "./config"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

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
      <div className="rounded-lg flex flex-col gap-4 p-6 ">
        {steps.map((step, index) => {
          return (
            <div key={index}>
              <div className={`w-full rounded-lg p-2 transition-all border bg-accent ${activeStep - 1 == index ? '' : 'opacity-50'}`}>
                <div className="flex flex-col-reverse sm:flex-row gap-2 items-start justify-between sm:items-center p-4">
                  <p className="text-xl font-light">{index + 1}. {step.text}</p>
                  <p className="px-2 rounded-full bg-theme-purple font-light">{step.iconText}</p>
                  {index === 0 && activeStep === 1 && (
                    <Button variant="outline" className="w-full sm:w-fit" asChild>
                      <Link href="/bridge">
                        <ChevronLeft className="w-4 h-auto -ml-1 mr-1" />
                        Back
                      </Link>
                    </Button>
                  )}
                </div>
                <div>
                  {activeStep - 1 == index && (
                    <>{children}</>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}