import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 h-screen text-zinc-100 flex flex-col justify-between snap-y snap-mandatory overflow-y-scroll no-scrollbar break-all">
      <div className="flex w-full justify-end py-4 px-8 fixed top-0 right-0 left-0 z-10">
        <Link
          href="/bridge"
          className="text-green-500 hover:bg-zinc-800 border-2 border-green-500 rounded-full font-medium px-4 py-2"
        >Bridging Interface</Link>
      </div>
      <div className="min-h-screen h-screen flex flex-col snap-center">
        <div className="flex-grow flex items-center">
            <div className="text-9xl pl-8 mt-24">
                <h1>A Cross-Chain</h1>
                <h1><span className="text-green-500">Messaging Protocol</span>.</h1>
            </div>
        </div>
        <div className="items-center justify-center pb-32 mb-8">
            <div className="text-center text-4xl">
                warp.green allows your app to communicate across blockchains
            </div>
        </div>
        <div className="mx-auto pt-16 pb-4 flex items-center justify-center text-zinc-300">
            <CevronDoubleDownIcon /> 
            <p className="px-4">scroll down for more</p>
            <CevronDoubleDownIcon />
        </div>
      </div>
      <div className="min-h-screen h-screen snap-center">
        <div className="mx-4 mb-4 mt-16 pt-4 grid grid-cols-3 gap-16">
          <div>
            <>
              <h1 className="text-7xl">At a glance</h1>
              <h3 className="text-2xl text-zinc-300 pt-8">Key protocol statistics</h3>
            </>
            <div className="border-zinc-700 rounded-lg border p-6 bg-zinc-900 mt-8">
              <p>Supported Networks</p>
            </div>
          </div>
          <div>Column 2</div>
          <div>Column 3</div>
          {/*  */}
        </div>
      </div>
    </div>
  );
}


// https://heroicons.com/
function CevronDoubleDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
    </svg>
  );
}
