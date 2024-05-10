"use client"
import Image from "next/image"
import WalletModal from "../WalletModal/WalletModal"
import TopBanner from "./TopBanner"
import EthereumWalletButton from "../EthereumWalletButton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay
} from "@/components/ui/dialog"
import { ExternalLink, X, ArrowUpRight } from "lucide-react"
import Link from "next/link"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Image src="/warp-green-logo.png" className="h-auto aspect-auto w-36" alt="warp.green logo" width={837} height={281} />

        {/* Mobile Menu */}
        <Dialog>
          <DialogOverlay className="backdrop-blur bg-transparent" />
          <DialogTrigger>
            <MenuIcon />
          </DialogTrigger>
          <DialogContent hideCloseButton className="bg-transparent max-h-screen overflow-y-auto border-none backdrop-blur w-full max-w-screen py-16 h-full flex flex-col !transition-none top-0 left-0 translate-x-0 !translate-y-0 !zoom-in-0 !slide-in-from-top-0 !slide-in-from-left-0 !zoom-out-0 !slide-out-from-top-0 !slide-out-from-left-0">
            <DialogHeader>
              <DialogTitle className="text-left">Menu</DialogTitle>
            </DialogHeader>

            <nav>
              <ul className="text-xl gap-1">
                <li><DialogClose asChild><Link className="w-full flex" href="/bridge">Bridge Interface</Link></DialogClose></li>
                <li><DialogClose asChild><Link className="w-full flex" href="/bridge/assets">Supported Assets</Link></DialogClose></li>
                <li><DialogClose asChild><Link className="w-full flex" href="https://docs.warp.green/" target="_blank">FAQ <ArrowUpRight className="mb-2 w-4 h-auto" /></Link></DialogClose></li>
                <li><DialogClose asChild><Link className="w-full flex" href="https://docs.warp.green/developers/introduction" target="_blank">Docs <ArrowUpRight className="w-4 mb-2 h-auto" /></Link></DialogClose></li>
              </ul>
            </nav>

            <div className="mt-auto w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <EthereumWalletButton />
              <WalletModal />
            </div>

            <DialogClose className="absolute top-[4.5rem] right-6 hover:opacity-80"><X /></DialogClose>
          </DialogContent>
        </Dialog>


        {/* Desktop Menu */}
        <div className="fle gap-2 hidden">
          <EthereumWalletButton />
          <WalletModal />
        </div>
      </header>
    </>
  )
}

export default Header

const MenuIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-8 text-theme-green-foreground cursor-pointer hover:opacity-80 sm:hidden"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="M112 304h288M112 208h288"
      />
    </svg>
  )
}