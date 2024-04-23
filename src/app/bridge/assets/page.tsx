"use client";
import { useState } from "react";
import { NETWORKS, TOKENS } from "../config";

export default function AssetList() {
  return (
    <div className="text-zinc-300 max-w-3xl w-full mx-auto">
      <h1 className="text-2xl pb-2">Supported Assets</h1>
      <p className="pb-4">The following ERC-20 assets are currently available via this bridging interface: </p>
      <table className="w-full text-center">
        <thead>
          <tr>
            <th>Source Chain</th>
            <th>Token Symbol</th>
            <th>Source Address</th>
            <th>Destination Chain</th>
            <th>Destination Asset ID</th>
          </tr>
        </thead>
        <tbody>
          {TOKENS.map(token => 
            token.supported.map(tokenInfo => {
              const originNetwork = NETWORKS.find(network => network.id === tokenInfo.evmNetworkId)?.displayName;
              const destinationNetwork = NETWORKS.find(network => network.id === tokenInfo.coinsetNetworkId)?.displayName;

              return (
                <tr key={`${token.symbol}-${tokenInfo.assetId}`}>
                  <td>{originNetwork}</td>
                  <td>{token.symbol === 'ETH' ? 'milliETH' : token.symbol}</td>
                  <td><CopyableLongHexString hexString={tokenInfo.contractAddress} /></td>
                  <td>{destinationNetwork}</td>
                  <td><CopyableLongHexString hexString={tokenInfo.assetId} /></td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function CopyableLongHexString({
  hexString
} : {
  hexString: string
}) {
  const [isCopied, setIsCopied] = useState(false);
  const displayText = `${hexString.slice(0, 6)}...${hexString.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hexString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // Resets the icon after 3 seconds
  };

  return (
    <div
      className={`flex items-center justify-center ${isCopied ? '' : 'cursor-pointer'}`}
      onClick={isCopied ? () => {} : handleCopy}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
    >
      {displayText}
      {isCopied ? <CopySuccessIcon /> : <ClipboardIcon />}
    </div>
  );
}

// https://heroicons.com/
function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}


// https://heroicons.com/
function CopySuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
