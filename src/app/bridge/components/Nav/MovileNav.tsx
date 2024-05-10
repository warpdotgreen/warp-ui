"use client"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { X, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import EthereumWalletButton from "../../EthereumWalletButton"
import WalletModal from "../../WalletModal/WalletModal"
import GithubIcon from "@/components/Icons/GithubIcon"
import XIcon from "@/components/Icons/XIcon"
import { navConfig } from "./navConfig"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

function MobileNav() {
  const [open, setOpen] = useState<boolean>(false)
  const pathName = usePathname()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogOverlay className="backdrop-blur bg-transparent" />
      <AlertDialogTrigger className="transition-colors focus-visible:outline-none ring-offset-accent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <MenuIcon />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-transparent max-h-screen overflow-y-auto border-none backdrop-blur w-full max-w-screen py-16 h-full flex flex-col !transition-none top-0 left-0 translate-x-0 !translate-y-0 !zoom-in-0 !slide-in-from-top-0 !slide-in-from-left-0 !zoom-out-0 !slide-out-from-top-0 !slide-out-from-left-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">Menu</AlertDialogTitle>
        </AlertDialogHeader>

        <nav>
          <ul className="text-xl gap-1">

            {/* Main Links */}
            {navConfig.map(navItem => (
              <li key={navItem.name}>
                <AlertDialogCancel asChild>
                  <Link target={cn(navItem.isExternalLink ? '_blank' : '_self')} className={cn("transition-colors focus-visible:outline-none ring-offset-accent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full flex", pathName !== navItem.link && 'opacity-80 hover:opacity-100')} href={navItem.link}>
                    {navItem.name}
                    {navItem.isExternalLink && <ArrowUpRight className="w-4 mb-2 h-auto" />}
                  </Link>
                </AlertDialogCancel>
              </li>
            ))}

            {/* Social Icons */}
            <li className="mt-8">
              <ul className="flex gap-2">
                <li><AlertDialogCancel asChild><Link className="w-full flex transition-colors focus-visible:outline-none px-1 ring-offset-accent rounded-full focus-visible:ring-2 aspect-square focus-visible:ring-ring focus-visible:ring-offset-2" href="https://github.com/warpdotgreen" target="_blank"><GithubIcon /></Link></AlertDialogCancel></li>
                <li><AlertDialogCancel asChild><Link className="w-full flex transition-colors focus-visible:outline-none px-1 ring-offset-accent rounded-full focus-visible:ring-2 aspect-square focus-visible:ring-ring focus-visible:ring-offset-2" href="https://twitter.com/warpdotgreen" target="_blank"><XIcon /></Link></AlertDialogCancel></li>
              </ul>
            </li>
          </ul>
        </nav>

        <div className="mt-auto w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <EthereumWalletButton />
          <WalletModal />
        </div>

        <AlertDialogCancel className="absolute top-[4.5rem] right-6 hover:opacity-80 transition-colors focus-visible:outline-none ring-offset-accent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><X /></AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
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