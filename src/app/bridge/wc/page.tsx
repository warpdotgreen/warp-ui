"use client"

import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { useWallet } from "../ChiaWalletManager/WalletContext";
import { useAccount} from "wagmi";
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { BASE_NETWORK, ETHEREUM_NETWORK, TESTNET, WALLETCONNECT_PROJECT_ID_ETH, WcMetadata } from "../config";
import { base, baseSepolia, mainnet, sepolia } from "viem/chains";

export default function SuspensefulComponent() {
  return <Suspense><WalletConnectAutoConnect /></Suspense>;
}

function WalletConnectAutoConnect() {
  const [isXchLoading, setIsXchLoading] = useState(false);
  const { address: xchAddress, connectWallet, walletConnectUri } = useWallet()
  const { address, isConnecting } = useAccount()

  useEffect(() => {
    if(address && xchAddress) {
      window.location.href = '/bridge';
    }
  }, [address, xchAddress]);

  // Chia wallet
  useEffect(() => {
    const promise = async () => {
        setIsXchLoading(true);
        await connectWallet('chiawalletconnect', false)
    };

    if(!walletConnectUri && !isXchLoading && !xchAddress) {
      promise();
    }
    
    (window as any).xch_wc_uri = xchAddress ? 'connected' : (!walletConnectUri ? 'loading' : walletConnectUri);
  }, [connectWallet, walletConnectUri, isXchLoading, setIsXchLoading, xchAddress]);

  useEffect(() => {
    const promise = async () => {
      console.log({ address, isConnecting })
      if(address) {
        (window as any).eth_wc_uri = 'connected';
        return;
      }
      (window as any).eth_wc_uri = 'loading';

      if(!address && !isConnecting) {
        const provider = await EthereumProvider.init({
          optionalChains: [
            TESTNET ? baseSepolia.id : base.id,
            TESTNET ? sepolia.id : mainnet.id,
          ],
          projectId: WALLETCONNECT_PROJECT_ID_ETH,
          metadata: WcMetadata,
          showQrModal: false,
          rpcMap: {
            [BASE_NETWORK.chainId!]: BASE_NETWORK.rpcUrl,
            [ETHEREUM_NETWORK.chainId!]: ETHEREUM_NETWORK.rpcUrl
          },
        });

        function handleURI(uri: string) {
          (window as any).eth_wc_uri = uri;
        }

        provider.on('display_uri', handleURI)

        console.log("awaiting connect...")
        const resp = await provider.enable()
        console.log("connected!")
        console.log({ resp })

        const result = await provider.request({ method: "eth_requestAccounts" });
        const addr: string = (result as any)[0];

        localStorage.setItem("wagmi.recentConnectorId", "\"walletConnect\"");
        localStorage.setItem("wagmi.walletConnect.requestedChains", "[8453,1]");
        localStorage.setItem("wagmi.store", '{"state":{"connections":{"__type":"Map","value":[["281a266e4cb",{"accounts":["' + addr + '"],"chainId":8453,"connector":{"id":"walletConnect","name":"WalletConnect","type":"walletConnect","uid":"281a266e4cb"}}]]},"chainId":8453,"current":"281a266e4cb"},"version":2}');
        localStorage.setItem("@w3m/connected_connector", "WALLET_CONNECT");

        console.log('yay! - just refresh the page');
        (window as any).eth_wc_uri = 'connected';

        window.location.reload();
        
        console.log({ providerConnected: provider.connected, a: provider.session })
      }
    };

    promise();
  }, [address, isConnecting]);

  return (
    <div className="max-w-md flex flex-col justify-center mx-auto w-full break-words grow">
      <p className="text-center text-theme-green-foreground text-2xl font-light mb-4">Connecting wallets...</p>
      <p className="text-center text-theme-purple mb-8">Taking more than a few seconds? Go to the <a href="/bridge" className="underline hover:opacity-75">bridge interface</a>.</p>
    </div>
  );
}
