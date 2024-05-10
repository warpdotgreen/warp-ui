"use client"
import GithubIcon from "@/components/Icons/GithubIcon"
import XIcon from "@/components/Icons/XIcon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { navConfig } from "./navConfig"

function DesktopNav() {
  const pathName = usePathname()
  return (
    <Button variant="outline" className="hover:bg-accent/100 hover:text-accent-foreground/100" asChild>
      <nav>
        <ul className="flex items-center gap-8">

          {/* Main Links */}
          {navConfig.map(navItem => (
            <li key={navItem.name}>
              <Link target={cn(navItem.isExternalLink ? '_blank' : '_self')} className={cn("transition-all w-full flex", pathName !== navItem.link && 'opacity-80 hover:opacity-100')} href={navItem.link}>
                {navItem.name}
                {navItem.isExternalLink && <ArrowUpRight className="w-4 mb-2 h-auto" />}
              </Link>
            </li>
          ))}

          {/* Social Icons */}
          <li className="-ml-2">
            <ul className="flex border border-input rounded-md -mr-3.5">
              <li><Link className="w-full flex opacity-80 px-2 hover:bg-input rounded-full aspect-square" href="https://twitter.com/warpdotgreen" target="_blank"><XIcon /></Link></li>
              <li><Link className="w-full flex opacity-80 px-2 hover:bg-input rounded-full aspect-square" href="https://github.com/warpdotgreen" target="_blank"><GithubIcon /></Link></li>
            </ul>
          </li>
        </ul>

      </nav>
    </Button>
  )
}

export default DesktopNav