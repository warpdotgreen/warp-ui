"use client"
import { Button } from "@/components/ui/button"
import Header from "./landingPageComponents/Header"
import Link from "next/link"
import Messages from "./landingPageComponents/Messages"
import Starfield from "./landingPageComponents/Starfield"

export default function LandingPage() {
  return (
    <>
      <Header />
      <Starfield
        starCount={1000}
        starColor={[255, 255, 255]} //[128, 100, 221]
        speedFactor={0.05}
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

            {/* <div className="flex flex-wrap gap-4 justify-center my-12 grayscale">
              {NETWORKS.map(n => (
                <div key={n.id} className="border rounded-full p-4 shadow-white shadow-sm flex items-center justify-center bg-accent">{getChainIcon(n.displayName, "w-12")}</div>
              ))}
            </div> */}

            {/* <h3 className="text-xl mb-4 font-light opacity-80 mt-24">Messages</h3> */}
            <div className="bg-accent border rounded-lg p-2 w-full mt-auto animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Messages />
            </div>

            {/* <div className="bg-accent border rounded-lg p-6 w-full mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col justify-center grow w-1/2">
                <h3 className="text-xl font-light">Latest Messages</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 justify-center animate-pulse w-full">
                <Messages />
              </div>
            </div> */}

          </div>
        </section>
      </main>
    </>
  )
}