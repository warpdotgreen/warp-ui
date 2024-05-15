"use client"
import { Button } from "@/components/ui/button"
import Header from "./landingPageComponents/Header"
import Link from "next/link"
import Messages from "./landingPageComponents/Messages"
import Starfield from "./landingPageComponents/Starfield"
import { NETWORKS } from "./bridge/config"
import { getChainIcon } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function LandingPage() {

  // Disable star animation speed if user prefers reduced-motion
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', () => {
      console.log(mediaQuery.media, mediaQuery.matches)
      setIsReducedMotion(true)
    })
  }, [])
  const starSpeed = isReducedMotion ? 0 : 0.05

  return (
    <>
      <Header />
      <Starfield
        starCount={1000}
        starColor={[255, 255, 255]}
        speedFactor={starSpeed}
        backgroundColor="black"
      />
      <main id="scrollContainer" className="relative px-4 sm:px-8 py-4">
        <section className="mx-auto min-h-[calc(100vh-144px)] flex justify-center">

          <div className="flex flex-col items-center">

            <div className="flex flex-col items-center justify-center h-full min-h-[min(100vh,30rem)]">
              <h1 className="text-4xl sm:text-7xl text-balance text-center font-light">A Cross-Chain Messaging Protocol</h1>
              <h2 className="opacity-80 text-center mt-4 text-pretty">warp.green allows your app to communicate across blockchains</h2>

              <div className="flex my-8 gap-2">
                <Button variant="ghost" asChild><Link href="https://docs.warp.green/developers" target="_blank">Developer Docs</Link></Button>
                <Button variant="outline" className="shadow-sm shadow-white" asChild><Link href="/bridge">Bridge Interface</Link></Button>
              </div>
            </div>

            {/* <h3 className="text-xl mb-4 font-light opacity-80 mt-24">Messages</h3> */}
            <div className="bg-accent border rounded-lg p-2 w-full mt-auto animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Messages />
            </div>

            <div className="flex flex-wrap gap-4 justify-center my-12">
              {NETWORKS.map(n => (
                <div key={n.id} className="border rounded-full p-4 shadow-white shadow-sm flex items-center justify-center bg-accent">{getChainIcon(n.displayName, "w-12")}</div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 w-full">

              <div className="z-10 bg-accent border rounded-md flex gap-4 p-2 justify-between overflow-hidden">
                <div className="text-xl self-center px-4">
                  Messages Delivered
                </div>
                <div className="translate-y-8 px-4">
                  <p className="text-9xl font-light">61</p>
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>
    </>
  )
}