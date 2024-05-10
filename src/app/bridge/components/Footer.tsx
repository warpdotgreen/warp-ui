import Image from "next/image"
import Link from "next/link"

function Footer() {
  return (
    <div className="flex p-4 justify-center text-muted-foreground pb-3">
      <div className="flex flex-wrap justify-center text-sm">
        <Link href="https://warp.green" className="text-theme-green-foreground hover:text-green-300 font-medium hover:underline">
          <Image src="/warp-green-logo.png" className="h-4 aspect-auto w-auto" alt="warp.green logo" width={837} height={281} />
        </Link>
      </div>
    </div>
  )
}

export default Footer