import { ClientProvider } from "./ClientProvider"
import { Suspense } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Button } from "@/components/ui/button"

export default function BridgeUILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      <div className="bg-black min-h-screen flex flex-col">
        <Button variant="outline" className="absolute left-0 backdrop-blur -translate-y-16 focus:translate-y-4 focus:translate-x-4" asChild>
          <a href="#main-content">Skip Navigation</a>
        </Button>
        <Header />
        <Suspense>
          <main id="main-content" className="flex flex-col w-full items-center h-full grow mx-auto transition-colors focus-visible:outline-none ring-offset-accent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {children}
          </main>
        </Suspense>

        <Footer />
      </div>
    </ClientProvider>
  )
}