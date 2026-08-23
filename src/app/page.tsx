import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const NEWS_URL = "https://x.com/warpdotgreen/status/2091423295971242371"

export default function IncidentPage() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center px-4 sm:px-8">
      <section className="max-w-xl w-full border bg-accent/50 rounded-lg p-8 sm:p-10 flex flex-col gap-6">
        <h1>
          <Image
            src="/warp-green-logo.png"
            alt="warp.green"
            width={837}
            height={281}
            className="h-7 sm:h-8 w-auto"
            priority
          />
        </h1>
        <div className="flex flex-col gap-4 text-lg leading-relaxed opacity-80">
          <p>
            We have recently identified two suspicious transactions of 85,000 wUSDC.b and 8,000 wUSDC. Preliminary analysis suggests they are malicious.
          </p>
          <p>
            We are coordonating with validators to pause the protocol. Updates will be posted on X.
          </p>
        </div>
        <Button variant="outline" size="lg" asChild className="w-fit">
          <Link href={NEWS_URL} target="_blank" rel="noopener noreferrer">
            Check for latest news
          </Link>
        </Button>
      </section>
    </main>
  )
}
