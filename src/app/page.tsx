import { Button } from "@/components/ui/button"
import Header from "./landingPageComponents/Header"
import Link from "next/link"
import Messages from "./landingPageComponents/Messages"
import Starfield from "./landingPageComponents/Starfield"
import { NETWORKS } from "./bridge/config"
import { getChainIcon } from "@/lib/utils"
import Image from "next/image"
import LiveApps from "./landingPageComponents/LiveApps"
import MessagesDelivered from "./landingPageComponents/MessagesDelivered"

export default function LandingPage() {
  return (
    <>
      <Header />
      <Starfield
        starCount={1000}
        starColor={[255, 255, 255]}
        speedFactor={0.05}
        backgroundColor="black"
      />
      <main id="scrollContainer" className="relative px-4 sm:px-8 py-4 pb-20">
        <section className="mx-auto min-h-[calc(100vh-144px)] flex justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="flex flex-col items-center justify-center h-full min-h-[min(100vh,25rem)] sm:min-h-[min(100vh,33rem)]">
              <h1 className="text-4xl sm:text-7xl text-balance text-center font-light">A Cross-Chain Messaging Protocol</h1>
              <h2 className="opacity-80 text-center mt-4 text-pretty">warp.green allows your app to communicate across blockchains</h2>

              <div className="flex my-8 gap-2">
                <Button variant="ghost" asChild><Link href="https://docs.warp.green/developers" target="_blank">Developer Docs</Link></Button>
                <Button variant="outline" className="shadow-sm shadow-white z-10" asChild><Link href="/bridge">Bridge Interface</Link></Button>
              </div>
            </div>

            <div className="bg-accent border rounded-lg p-2 w-full mt-auto animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Messages />
            </div>


            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">

              <MessagesDelivered />

              <div className="flex flex-col gap-4 justify-center bg-accent border rounded-md p-6 z-10 overflow-hidden">
                <p className="text-xl">Supported Chains</p>
                <div className="flex w-full justify-end translate-y-10 gap-4 animate-in fade-in slide-in-from-bottom-16 duration-500">
                  {NETWORKS.map(n => (
                    <div key={n.id} className="relative">
                      <p className="opacity-80 absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border backdrop-blur-lg bg-theme-purple/50 px-4 py-1 z-20">{n.displayName}</p>
                      <div className="border rounded-full aspect-square p-4 shadow-white/50 shadow-sm h-full flex items-center justify-center bg-accent">{getChainIcon(n.displayName, "w-16 h-auto sm:h-20 sm:w-auto")}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="z-10 bg-accent border rounded-md flex flex-col xl:col-span-2 gap-4 p-2 justify-between overflow-hidden">
                <div className="px-4 flex flex-col my-4 w-full">
                  <p className="text-xl">Live Apps</p>
                  <p className="opacity-80">Apps that use warp.green as an oracle</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <LiveApps />
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>
      <footer className="relative mt-auto flex items-center justify-center w-full pb-4 pt-12 z-10">
        <Link href="/" className="text-theme-green-foreground hover:opacity-80 hover:text-green-300 font-medium hover:underline transition-colors focus-visible:outline-none ring-offset-accent rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Image src="/warp-green-logo.png" className="h-3.5 aspect-auto w-auto" alt="warp.green logo" width={837} height={281} />
        </Link>
      </footer>
    </>
  )
}