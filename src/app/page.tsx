import { Button } from "@/components/ui/button"
import Header from "./landingPageComponents/Header"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="px-4 sm:px-8 py-4">

        <section className="mx-auto min-h-[calc(100vh-144px)] flex justify-center">

          <div className="flex flex-col items-center mt-24">
            <h1 className="text-4xl sm:text-7xl text-balance text-center font-light">A Cross-Chain Messaging Protocol</h1>
            <h2 className="opacity-80 text-center mt-4 text-pretty">warp.green allows your app to communicate across blockchains</h2>

            <div className="flex my-8 gap-2">
              <Button variant="ghost" asChild><Link href="https://docs.warp.green/developers">Developer Docs</Link></Button>
              <Button variant="outline" className="shadow-sm shadow-white" asChild><Link href="/bridge">Bridge Interface</Link></Button>
            </div>

            <div className="bg-accent border rounded-lg p-4 w-full mt-12">

            </div>

          </div>
        </section>
      </main>
    </>
  )
}