import { useState, useRef, useEffect, ReactNode } from 'react'
import { Button, type ButtonProps } from './ui/button'

interface CopyButtonProps {
  copyText: string
  height?: string
  disabled?: boolean
  children: ReactNode
  variant?: ButtonProps["variant"]
}

const CopyButton = ({ copyText, height, disabled = false, variant = "outline", children }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Ensures when button text changes to reflect copied text, the size doesn't change
  useEffect(() => {
    if (buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth
      buttonRef.current.style.minWidth = `${buttonWidth}px`
    }
  }, [])

  const handleCopy = () => {
    if (isCopied) return

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        setIsCopied(true)

        setTimeout(() => {
          setIsCopied(false)
        }, 1500)
      })
      .catch((error) => {
        console.error('Copy failed:', error)
        alert(`Failed to copy: ${copyText}`)
      })
  }

  const buttonStyle = (() => {
    // Default button style
    let style = "text-center py-1 flex items-center justify-center gap-2 px-4 whitespace-nowrap rounded-lg"
    let disabledStyle = disabled ? 'opacity-20 hover:opacity-20 cursor-not-allowed animate-pulse' : 'hover:opacity-80 cursor-pointer'
    let copiedStyle = isCopied ? 'cursor-default bg-theme-green hover:bg-theme-green border-theme-green-foreground hover:opacity-100' : 'text-brandDark dark:text-brandLight'
    return `${disabledStyle} ${copiedStyle} ${style}`
  })()

  return (
    <Button variant={variant} disabled={disabled} style={{ height: height }} onClick={handleCopy} ref={buttonRef} className={buttonStyle}>
      {!isCopied && <svg className="w-3.5 stroke-[54px] fill-brandDark aspect-square" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="128" y="128" width="336" height="336" rx="57" ry="57" fill="none" stroke="currentColor" strokeLinejoin="round" /><path d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {isCopied ? 'Copied' : children}
    </Button>
  )
}

export default CopyButton