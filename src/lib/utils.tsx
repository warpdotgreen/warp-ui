import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ReactNode } from "react"
import { BaseIcon, ChiaIcon, ETHIcon } from "@/app/bridge/components/Icons/ChainIcons"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withToolTip(triggerText: any, toolTopContent: string | ReactNode) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger className="rounded-full transition-colors focus-visible:outline-none ring-offset-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{triggerText}</TooltipTrigger>
        <TooltipContent>
          <p>{toolTopContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function getChainIcon(chainName: string, className?: string) {
  switch (chainName) {
    case "Base":
      return <BaseIcon className={cn("w-8 h-auto shrink-0", className)} />
    case "Chia":
      return <ChiaIcon className={cn("w-8 h-auto shrink-0", className)} />
    case "Ethereum":
      return <ETHIcon className={cn("w-8 h-auto shrink-0", className)} />
    default:
      break
  }
}