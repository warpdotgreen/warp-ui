"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

function Header() {
  return (
    <>
      <header className="flex justify-between items-center px-4 sm:px-8 py-4">
        <Link href="/" className="select-none hover:opacity-80 w-fit transition-colors focus-visible:outline-none ring-offset-accent focus-visible:ring-2 rounded focus-visible:ring-ring focus-visible:ring-offset-2">
          <Image src="/warp-green-logo.png" className="h-5 aspect-auto w-auto" alt="warp.green logo" width={837} height={281} priority />
        </Link>

        <Button variant="outline" className="" asChild>
          <Link href="/bridge">Bridge Interface</Link>
        </Button>
      </header>
    </>
  )
}

export default Header