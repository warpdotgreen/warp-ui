"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay
} from "@/components/ui/dialog"
import { X, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import EthereumWalletButton from "../../EthereumWalletButton"
import WalletModal from "../../WalletModal/WalletModal"
import GithubIcon from "@/components/Icons/GithubIcon"
import XIcon from "@/components/Icons/XIcon"
import { navConfig } from "./navConfig"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function MobileNav() {
  const pathName = usePathname()
  return (
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

            {/* Main Links */}
            {navConfig.map(navItem => (
              <li key={navItem.name}>
                <DialogClose asChild>
                  <Link target={cn(navItem.isExternalLink ? '_blank' : '_self')} className={cn("transition-all w-full flex", pathName !== navItem.link && 'opacity-80 hover:opacity-100')} href={navItem.link}>
                    {navItem.name}
                    {navItem.isExternalLink && <ArrowUpRight className="w-4 mb-2 h-auto" />}
                  </Link>
                </DialogClose>
              </li>
            ))}

            {/* Social Icons */}
            <li className="mt-8">
              <ul className="flex gap-2">
                <li><DialogClose asChild><Link className="w-full flex" href="https://github.com/warpdotgreen" target="_blank"><GithubIcon /></Link></DialogClose></li>
                <li><DialogClose asChild><Link className="w-full flex" href="https://twitter.com/warpdotgreen" target="_blank"><XIcon /></Link></DialogClose></li>
              </ul>
            </li>
          </ul>
        </nav>

        <div className="mt-auto w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <EthereumWalletButton />
          <WalletModal />
        </div>

        <DialogClose className="absolute top-[4.5rem] right-6 hover:opacity-80"><X /></DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export default MobileNav

const MenuIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-8 text-theme-green-foreground cursor-pointer hover:opacity-80"
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