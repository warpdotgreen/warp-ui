import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withToolTip(triggerText: any, toolTopContent: string) {
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