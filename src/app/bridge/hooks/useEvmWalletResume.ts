"use client"

import { useCallback, useEffect } from "react"
import { useReconnect } from "wagmi"

export function useEvmWalletResume(onVisible?: () => void) {
  const { reconnect } = useReconnect()

  const handleVisible = useCallback(() => {
    reconnect()
    onVisible?.()
  }, [reconnect, onVisible])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleVisible()
      }
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        handleVisible()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pageshow", onPageShow)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [handleVisible])

  return { resumeWallet: handleVisible }
}
