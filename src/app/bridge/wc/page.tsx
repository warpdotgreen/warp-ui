"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWallet } from "../ChiaWalletManager/WalletContext";
import { useAccount, useConnect, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function WalletConnectAutoConnect() {
  const { connectWallet, walletConnected, walletConnectUri } = useWallet()
  const { address, isConnecting } = useAccount()
  const [ethWalletConnectUri, setEthWalletConnectUri] = useState<string | null>(null)
  const [showButton, setShowButton] = useState(false)
  const { data: walletClient } = useWeb()

  useEffect(() => {
    const promise = async () => {
      const { transport } = walletClient;
      const provider = new providers.Web3Provider(transport, network);
    };

    promise();
  }, [address, isConnecting]);

  // show button 7 seconds after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showButton) {
        setShowButton(true);
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [showButton, setShowButton]);

  useEffect(() => {
    const promise = async () => {
      if(!walletConnected && !walletConnectUri) {
        await connectWallet('chiawalletconnect', false)
      }
    };

    promise();
  }, [connectWallet, walletConnected, walletConnectUri]);

  useEffect(() => {
    if(address && walletConnected) {
      window.location.href = '/bridge';
    }
  }, [address, walletConnected]);

  return (
    <div className="max-w-md flex flex-col justify-center mx-auto w-full break-words grow">
      <p className="text-center text-theme-green-foreground text-lg font-light mb-8">Connecting wallets, please wait...</p>
      <p className="text-theme-purple">Chia: {walletConnected ? 'Connected' : 'Not connected (see link below)'}</p>
      {!walletConnected && (walletConnectUri ? <p id="chia-wc-string" className="text-theme-purple whitespace-nowrap overflow-x-scroll scrollbar-hide">{walletConnectUri}</p> : 'Loading...')}
      <p className="text-theme-purple mt-4">Ethereum: {address ? 'Connected' : 'Not connected'}</p>
      {showButton && <a href="/bridge"><Button
        type="submit"
        className="mt-16 w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl animate-in fade-in slide-in-from-bottom-2 duration-500" 
        onClick={() => {}}>Go to bridgning interface</Button></a>}
    </div>
  );
}
