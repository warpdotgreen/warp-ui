"use client";
import { ChiaWalletContext } from "./ChiaWalletContext";
import * as GreenWeb from 'greenwebjs';
import { CHIA_NETWORK } from "./config";

export function ChiaWalletButton() {
  return (
    <ChiaWalletContext.Consumer>
      {
        (chiaWalletContext) => {
          if(chiaWalletContext.connected) {
            const displayStr = chiaWalletContext.address.slice(0, 6) + '...' + chiaWalletContext.address.slice(-6);
            return (
              <button
                className="text-md border border-zinc-800 px-4 rounded-full text-zinc-300 bg-zinc-950 hover:bg-zinc-900 py-0 font-semibold text-center"
                onClick={() => { alert("Disconnect functionality not implemented yet") }}
              >
                {displayStr}
              </button>
            );
          }

          const connectWallet = async () => {
            try {
                await window.chia.request({ method: "connect" });
                const puzzle_hash = window.chia.selectedAddress;
                const address = GreenWeb.util.address.puzzleHashToAddress(puzzle_hash, CHIA_NETWORK.prefix);

                chiaWalletContext.setChiaWalletContext({
                  ...chiaWalletContext,
                  connected: true,
                  address: address,
                });
            } catch (err) {
                alert('Failed to connect wallet');
                console.log(err);
            }
          };
          return (
            <button
              className="text-md px-4 rounded-full text-zinc-100 bg-green-500 hover:bg-green-600 py-2 font-semibold text-center"
              onClick={connectWallet}
            >
              Connect Chia Wallet
            </button>
          );
        }
      }
    </ChiaWalletContext.Consumer>
  )
}
