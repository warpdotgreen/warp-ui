"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWallet } from "../ChiaWalletManager/WalletContext";
import { http, useAccount, useConnect, WagmiProvider} from "wagmi";
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { BASE_NETWORK, ETHEREUM_NETWORK, TESTNET, wagmiConfig, WALLETCONNECT_PROJECT_ID_ETH, WcMetadata } from "../config";
import { base, baseSepolia, mainnet, sepolia } from "viem/chains";
import { web3Modal } from "../ClientProvider";
import SignClient from '@walletconnect/sign-client'
import { walletConnect } from 'wagmi/connectors'
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function WalletConnectAutoConnect() {
  const { connectWallet, walletConnected, walletConnectUri } = useWallet()
  const { address, isConnecting } = useAccount()
  const [ethWalletConnectUri, setEthWalletConnectUri] = useState<string | null>(null)
  const [showButton, setShowButton] = useState(false)
  const { connect } = useConnect();

  useEffect(() => {
    const promise = async () => {
      console.log({ address, isConnecting })
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
          storageOptions: {}
        });

        function handleURI(uri: string) {
          console.log({ uri })
        }

        if(!provider.connected) {
          provider.on('display_uri', handleURI)

          console.log("awaiting connect...")
          await provider.connect()
          const resp = await provider.enable()
          console.log("connected!")
          console.log({ resp })
        } 
        
        console.log({ providerConnected: provider.connected, a: provider.session })

        // this also works but doesn't set wagmi values the good way
      //   const signClient = await SignClient.init({
      //     projectId: WALLETCONNECT_PROJECT_ID_ETH,
      //     metadata: WcMetadata,
      //     // storage: new CustomWalletConnectStorage("chia-wc-data")
      //   })

      //   const sessions = signClient.session.getAll();
      //   console.log({ sessions: sessions })

      //   if(sessions.length > 0) { return; }

      //   const { uri, approval } = await signClient.connect({
      //     requiredNamespaces: {
      //       eip155: {
      //         chains: [`eip155:${BASE_NETWORK.chainId!}`, `eip155:${ETHEREUM_NETWORK.chainId!}`],
      //         methods: ["eth_accounts","eth_requestAccounts","eth_sendRawTransaction","eth_sign","eth_signTransaction","eth_signTypedData","eth_signTypedData_v3","eth_signTypedData_v4","eth_sendTransaction","personal_sign","wallet_switchEthereumChain","wallet_addEthereumChain","wallet_getPermissions","wallet_requestPermissions","wallet_registerOnboarding","wallet_watchAsset","wallet_scanQRCode","wallet_sendCalls","wallet_getCapabilities","wallet_getCallsStatus","wallet_showCallsStatus"],
      //         events: ["chainChanged","accountsChanged","message","disconnect","connect"]
      //       }
      //     }
      //   })

      //   console.log({ uri })
      //   const session = await approval()
      //   console.log({ session })
      }
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
