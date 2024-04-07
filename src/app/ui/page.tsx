"use client";

export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col justify-between">
      <div className="flex justify-between px-8 py-4 border-b border-zinc-700 bg-zinc-950">
        <div className="text-green-500 text-2xl font-normal">warp.green</div>
        <div className="flex">
          <div className="h-8 px-4 rounded-full bg-zinc-500 pt-1 mr-2">Wallet 1 here</div>
          <div className="h-8 px-4 rounded-full bg-zinc-500 pt-1">Wallet 2 here</div>
        </div>
      </div>

      <div className="max-w-md mx-auto py-8">
        <div className="mx-auto border-zinc-700 rounded-lg border p-6 bg-zinc-900">
          <form className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-right items-center">
                <label className="text-zinc-300 text-xl font-medium pr-4">Token</label>
                <select className="px-2 py-2 border border-zinc-700 rounded bg-zinc-800 text-zinc-100 outline-none">
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>XCH</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <BlockchainDropdown />
                <button
                  type="button"
                  className="mx-2 p-2 text-zinc-300 hover:bg-zinc-700 rounded-xl"
                >
                  <ChangeArrow />
                </button>
                <BlockchainDropdown />
              </div>
              <input
                type="text"
                placeholder="Amount"
                className="w-full px-2 py-2 border border-zinc-700 rounded outline-none bg-zinc-800 text-zinc-300 placeholder-zinc-500 text-lg"
                pattern="^\d*(\.\d{0,8})?$"
              />
              <input
                type="text"
                placeholder="Receive Address"
                className="w-full px-2 py-2 border border-zinc-700 rounded outline-none bg-zinc-800 text-zinc-300 placeholder-zinc-500 text-lg"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-64 p-2 border border-zinc-700 rounded-3xl bg-green-500 font-medium text-zinc-950 hover:bg-green-700 transition-colors duration-300"
              >
                Bridge
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <p className="text-zinc-300">Docs | Twitter | Terms</p>
      </div>
    </div>
  );
}

function BlockchainDropdown() {
  return (
    <select className="px-2 py-2 border flex-1 border-zinc-700 rounded bg-zinc-800 text-zinc-300 outline-none">
      <option>Ethereum</option>
      <option>Base</option>
      <option>Chia</option>
    </select>
  );
}

// https://heroicons.com/ 
function ChangeArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}
