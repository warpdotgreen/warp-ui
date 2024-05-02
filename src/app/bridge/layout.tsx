import Link from "next/link"
import { ClientProvider } from "./ClientProvider"
import { TESTNET } from "./config"
import EthereumWalletButton from "./EthereumWalletButton"
import { Suspense } from "react"
import ChiaWalletModal from "./ChiaWalletModal"

export default function BridgeUILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      <div className="bg-zinc-950 min-h-screen flex flex-col justify-between">
        <div>
          {TESTNET && <div className="text-yellow-300 bg-red-500 text-center w-full py-2 px-4 font-bold">
            This is a testnet interface. Do not use mainnet funds. Make sure Goby is on <span className="text-blue-500">testnet11</span> and your Ethereum wallet is on <span className="text-blue-500">Sepolia</span> or <span className="text-blue-500">Base Sepolia</span>.
          </div>}
          <div className="flex justify-between px-8 py-4 border-b border-zinc-700 bg-zinc-950">
            <div className="text-zinc-300 text-2xl font-normal pt-1">Bridging Interface</div>
            <div className="flex space-x-2">
              <EthereumWalletButton />
              <ChiaWalletModal />
            </div>
          </div>
        </div>

        <Suspense>
          {children}
        </Suspense>

        {/* footer */}

        <div className="flex justify-center text-zinc-300 pb-3">
          <div className="flex-col">
            <div>
              <Link
                href="https://docs.warp.green/"
                target="_blank"
                className="px-2 underline hover:text-zinc-100"
              >
                FAQ
              </Link> |
              <Link
                href="/bridge/assets"
                className="px-2 underline hover:text-zinc-100"
              >
                Supported Assets
              </Link> |
              <Link
                href="https://docs.warp.green/developers/introduction"
                target="_blank"
                className="px-2 underline hover:text-zinc-100"
              >
                Docs
              </Link> |
              <Link
                href="https://twitter.com/warpdotgreen"
                target="_blank"
                className="px-2 underline hover:text-zinc-100"
              >
                Twitter
              </Link> |
              <Link
                href="https://github.com/warpdotgreen"
                target="_blank"
                className="pl-2 underline hover:text-zinc-100"
              >
                GitHub
              </Link>
            </div>
            <div className="flex justify-center pt-3">
              <Sparkles />
              <span className="pl-1">powered by</span>
              <Link href="https://warp.green" className="text-green-500 hover:text-green-300 pl-1 pr-2 font-medium underline">warp.green</Link>
            </div>
          </div>
        </div>
      </div>
    </ClientProvider>
  )
}

// https://heroicons.com/ 
function Sparkles() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}
