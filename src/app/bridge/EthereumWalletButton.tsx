"use client";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-button": any;
    }
  }
}

export default function EthereumWalletButton() {
  return (
    <w3m-button balance='hide' label="Connect Ethereum Wallet"/>
  );
}
