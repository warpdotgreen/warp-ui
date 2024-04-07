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
          <form className="space-y-8">
            <div className="space-y-3">
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
                  className="mx-2 text-green-500 border-2 border-green-500 rounded-full px-3"
                >
                  →
                </button>
                <BlockchainDropdown />
              </div>
              <input
                type="text"
                placeholder="Amount"
                className="w-full px-3 py-2 border-2 border-green-500 rounded bg-gray-900 text-green-500 placeholder-green-500 text-lg"
                pattern="^\d*(\.\d{0,8})?$"
              />
              <input
                type="text"
                placeholder="Receive Address"
                className="w-full px-3 py-2 border-2 border-green-500 rounded bg-gray-900 text-green-500 placeholder-green-500 text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 border-2 border-green-500 rounded bg-black text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300"
            >
              Bridge
            </button>
          </form>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <p className="text-green-500">Docs | Twitter | Terms</p>
      </div>
    </div>
  );
}

function InputElement() {
  return (
    <div className="flex items-center space-x-2 px-3 py-4 border-2 border-green-500 rounded">
      <input
        type="text"
        placeholder="Amount"
        className="flex-shrink min-w-0 outline-none bg-gray-900 text-green-500 placeholder-green-500 text-lg"
      />
      <select className="flex-grow-0 px-3 py-2 border-2 border-green-500 rounded bg-gray-900 text-green-500 outline-none">
        <option>Chia</option>
        <option>Base</option>
        <option>Ethereum</option>
      </select>
      <select className="flex-grow-0 px-3 py-2 border-2 border-green-500 rounded bg-gray-900 text-green-500 outline-none">
        <option>ETH</option>
        <option>USDC</option>
      </select>
    </div>
  );
}

function BlockchainDropdown() {
  return (
    <select className="px-3 py-2 border-2 border-green-500 rounded bg-gray-900 text-green-500 outline-none">
      <option>Ethereum</option>
      <option>Base</option>
      <option>Chia</option>
    </select>
  );
}
