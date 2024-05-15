import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function CopyableLongHexString({ hexString, className, tooltipText = "Copy" }: { hexString: string, className?: string, tooltipText?: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const displayText = `${hexString.slice(0, 6)}...${hexString.slice(-4)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hexString)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000) // Resets the icon after 3 seconds
  }

  const copyElement = (
    <p className={cn(`opacity-80 select-none hover:opacity-60 bg-accent w-fit px-2 py-0.5 text-sm rounded text-primary/80`, isCopied ? 'opacity-60' : 'cursor-pointer', className)} onClick={isCopied ? () => { } : handleCopy}>
      {isCopied ? 'Copied' : displayText}
    </p>
  )
  if (isCopied) return copyElement

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild className="transition-colors focus-visible:outline-none ring-offset-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {copyElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
  )
}