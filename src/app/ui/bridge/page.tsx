"use client";

import { ChiaWalletContext } from "../chia_wallet_context";

export default function BridgingFirstStep() {

  const sourceChain = "Base";
  const destinationChain = "Chia";

  return (
    <ChiaWalletContext.Consumer>
      {(chiaWalletContext) => {
        return (
          <div className="max-w-lg w-full mx-auto py-8">
            <div className="mx-auto border-zinc-700 rounded-lg border p-6 bg-zinc-900">
              <div className="space-y-6">
                <div className={`space-y-2 ${true ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium">1. Send tokens on {sourceChain}</p>
                    </div>
                    <div className="mx-6">
                      {true && (
                        <p className="text-zinc-100">Hello world!</p>
                      )}
                    </div>
                  </div>
                  <div className={`space-y-2 ${false ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium">2. Wait for transaction confirmation</p>
                      <div className="flex">
                        <ClockIcon />
                        <span className="ml-1">18 min</span>
                      </div>
                    </div>
                  </div>
                  <div className={`space-y-2 ${false ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium">3. Claim tokens on {destinationChain}</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        );
      }}
    </ChiaWalletContext.Consumer>
  );
}

// https://heroicons.com/
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
  );
}
