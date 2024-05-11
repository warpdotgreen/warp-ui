import { ClientProvider } from "./ClientProvider"
import { Suspense } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"

export default function BridgeUILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      <div className="bg-black min-h-screen flex flex-col">
        <Header />
        <Suspense>
          {children}
        </Suspense>

        <Footer />
      </div>
    </ClientProvider>
  )
}