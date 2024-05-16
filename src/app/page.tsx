"use client"
import { Button } from "@/components/ui/button"
import Header from "./landingPageComponents/Header"
import Link from "next/link"
import Messages from "./landingPageComponents/Messages"
import { NETWORKS } from "./bridge/config"
import { getChainIcon } from "@/lib/utils"
import LiveApps from "./landingPageComponents/LiveApps"
import MessagesDelivered from "./landingPageComponents/MessagesDelivered"
import Script from "next/script"
import { ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LandingPage() {
  return (
    <>
      <Header />
      <canvas id="canvas" className="absolute z-[-10] bg-zinc-950"></canvas>
      <main id="scrollContainer" className="relative px-4 sm:px-8 py-4 2xl:snap-y 2xl:snap-mandatory h-[100svh] overflow-y-scroll no-scrollbar">


        {/* SLIDE 1 */}
        <section id="slide1" className="slide relative sm:mt-[72px] h-[100svh] min-h-96 snap-center">
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <h1 className="text-4xl sm:text-7xl text-balance text-center font-light">A Cross-Chain <span className="text-theme-purple">Messaging</span> <span className="text-theme-green-foreground">Protocol</span></h1>
            <h2 className="opacity-80 text-center mt-4 text-pretty text-3xl">warp.green allows your app to communicate across blockchains</h2>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex-col gap-2 flex items-center">
            <p>Scroll Down</p>
            <ChevronDown className=" animate-bounce" />
          </div>

        </section>

        {/* SLIDE 2 */}
        <section id="slide2" className="max-w-[130rem] mx-auto slide 2xl:h-[max(100svh,60rem)] my-auto 2xl:snap-start grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-24 2xl:gap-y-4 grow-rows-3 p-0 sm:p-8 !pt-[144px] gap-4">

          {/* Col 1 */}
          <div className="flex flex-col gap-4 max-h-[51.5rem]">

            <div className="flex flex-col gap-4 justify-center items-center">
              <h3 className="text-4xl sm:text-6xl font-light">At a Glance</h3>
              <h4 className="text-xl opacity-80">A few points about warp.green</h4>
            </div>

            <div className="h-full row-span-1">
              <MessagesDelivered />
            </div>

            <div className="flex flex-col gap-4 justify-center bg-accent/50 hover:bg-accent/90 transition-colors border rounded-md p-6 z-10 overflow-hidden h-full row-span-1">
              <p className="text-xl text-center">Supported Chains</p>
              <div className="flex w-full h-full justify-end gap-4 animate-in fade-in slide-in-from-bottom-16 duration-500">
                <SupportedNetworksCard />
              </div>
            </div>

          </div>


          {/* Col 2 */}
          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-4 justify-center items-center">
              <h3 className="text-4xl sm:text-6xl font-light">Live Apps</h3>
              <h4 className="text-xl opacity-80 text-center">Apps that use warp.green as an oracle</h4>
            </div>

            <LiveApps />

          </div>


          {/* Col 3 */}
          <div className="flex flex-col gap-4 overflow-y-hidden">

            <div className="flex flex-col gap-4 justify-center items-center">
              <h3 className="text-4xl sm:text-6xl font-light">Messages</h3>
              <h4 className="text-xl opacity-80 text-center">Latest messages processed by warp.green</h4>
            </div>

            <div className="relative row-span-2 h-full no-scrollbar">
              <ScrollArea className="hidden max-h-[600px] 2xl:max-h-full 2xl:flex flex-col gap-4 h-full w-full 2xl:pr-3 overflow-y-hidden 2xl:overflow-y-scroll no-scrollbar">
                <Messages />
              </ScrollArea>
              <div className="overflow-y-hidden 2xl:hidden">
                <Messages />
              </div>
            </div>
          </div>


        </section>

        <section id="slide3" className="slide h-[100svh] mt-[72px] snap-center flex flex-col gap-8 items-center justify-center pt-[72px]">
          <h3 className="text-3xl text-balance sm:text-5xl text-center">Ready to <span className="text-theme-green-foreground font-light">warp</span>? Check out our <Link href="https://docs.warp.green/developers/" className="underline">developer docs</Link>.</h3>
        </section>

      </main>
      <Script
        src="/frontpage.js"
        strategy="afterInteractive"
        onLoad={() => console.log('frontpage.js script loaded successfully')}
      />
      <Script id="disable-body-scroll">{`document.body.style.overflow = 'hidden';`}</Script>
    </>
  )
}

function SupportedNetworksCard() {
  return (
    <div className="flex h-full justify-between w-full items-center sm:mx-8">
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 aspect-square sm:h-auto p-3 rounded-full border border-zinc-700 bg-zinc-900 bg-opacity-50 hover:bg-opacity-90 flex items-center justify-center">
          <img src="https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg" alt="Network" className="w-full h-full rounded-full object-cover" />
        </div>
        <p className="text-center text-zinc-300 pt-2">Base</p>
      </div>
      <div className="w-full h-px bg-zinc-700 flex-grow relative mb-8"></div>
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 aspect-square sm:h-auto p-2 rounded-full border border-zinc-700 bg-zinc-900 bg-opacity-50 hover:bg-opacity-90 flex items-center justify-center">
          <img src="https://www.chia.net/wp-content/uploads/2023/06/chia_icon_green-hex5ECE71.svg?w=64" alt="Network" className="w-full h-full rounded-full object-cover" />
        </div>
        <p className="text-center text-zinc-300 pt-2">Chia</p>
      </div>
      <div className="w-full h-px bg-zinc-700 flex-grow relative mb-8"></div>
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 aspect-square sm:h-auto p-3 rounded-full border border-zinc-700 bg-zinc-900 bg-opacity-50 hover:bg-opacity-90 flex items-center justify-center">
          {/* <img src="https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/public/assets/eth-diamond-black-gray.png" alt="Network" className="w-full h-full rounded-full object-cover" /> */}
          {/* <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" alt="Network" className="w-full h-full rounded-full object-cover" /> */}
          <svg className="w-full h-full rounded-full object-cover" width="256px" height="417px" viewBox="0 0 256 417" version="1.1" preserveAspectRatio="xMidYMid">
            <g>
              <polygon fill="#343434" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32" />
              <polygon fill="#8C8C8C" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158" />
              <polygon fill="#3C3C3B" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866" />
              <polygon fill="#8C8C8C" points="127.962 416.9052 127.962 312.1852 0 236.5852" />
              <polygon fill="#141414" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587" />
              <polygon fill="#393939" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588" />
            </g>
          </svg>
        </div>
        <p className="text-center text-zinc-300 pt-2">Ethereum</p>
      </div>
    </div>
  )
}

function ArrowRight() {
  return (
    <svg className="opacity-80 w-6 h-auto" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}