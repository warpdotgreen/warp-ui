import Image from "next/image"
import Link from "next/link"

function Footer() {
  return (
    <div className="flex px-4 pt-12 pb-4 justify-center text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-1 items-center">
        <p className="text-theme-purple">Powered By</p>
        <Link href="/" className="text-theme-green-foreground hover:opacity-80 hover:text-green-300 font-medium hover:underline transition-colors focus-visible:outline-none ring-offset-accent rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Image src="/warp-green-logo.png" className="h-3.5 aspect-auto w-auto" alt="warp.green logo" width={837} height={281} />
        </Link>
      </div>
    </div>
  )
}

export default Footer