"use client";
import Image from "next/image";
import { useState } from 'react';
import { findLatestPortalState } from '../util/portal_receiver';  
import { BRIDGE_CONTRACT_ABI, BRIDGE_CONTRACT_ADDRESS } from "@/util/bridge";
import { ethers } from "ethers";
import * as GreenWeb from 'greenwebjs';

export default function Home() {
  const [offer, setOffer] = useState('');
  const [ethAmount, setEthAmount] = useState('0.003');
  const [xchAddress, setXchAddress] = useState('txch1ak7dup645fr562t2u9rs30d60qh9t89nyxvezwpkd5v29m62z6aqwmmxge');
  const [ethTxHash, setEthTxHash] = useState('0x443441bb5a1a38546134064fcf117f3c2ce598a8da57b2b86647905c9d59d5ff');
  const [messageData, setMessageData] = useState({});
  const [coinId, setCoinId] = useState('click button below');
  const [nonces, setNonces] = useState({});

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(offer);
  };

  const fetchPortalInfo = async () => {
    const { coinId, nonces } = await findLatestPortalState();
    setCoinId(coinId);
    setNonces(nonces);
  };

  const sendEthToBridge = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('plz install metamask ser');
      return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(BRIDGE_CONTRACT_ADDRESS, BRIDGE_CONTRACT_ABI, signer);
    const totalAmount = ethers.parseEther("0.00001") + ethers.parseEther(ethAmount);
    console.log({ totalAmount })

    try {
      const receiver = "0x" + GreenWeb.util.address.addressToPuzzleHash(xchAddress);
      const tx = await contract.bridgeEtherToChia(receiver, { value: totalAmount });
      await tx.wait();
      alert('Transaction confirmed!');
      setEthTxHash(tx.hash);
    } catch (error) {
      alert('Transaction failed:' + error);
      console.log(error);
      return; 
    }
  };

  const fetchEventData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(ethTxHash);

    const eventSignature = ethers.id("MessageSent(bytes32,bytes3,bytes32,bytes32[])");
    const eventLog = receipt!.logs.filter(log => log.topics[0] === eventSignature)[0];

    const indexedNonce = eventLog.topics[1];
    const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
        ["bytes3", "bytes32", "bytes32[]"], // Adjusted for the remaining parameters
        eventLog.data
    );


    /* 
    event MessageSent(
        bytes32 indexed nonce,
        bytes3 destination_chain,
        bytes32 destination,
        bytes32[] contents
    );
    */
    setMessageData({
      nonce: indexedNonce,
      destination_chain: decodedData[0],
      destination: decodedData[1],
      contents: decodedData[2]
    })
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-48">
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">1. Send ETH to Bridge</label>
        <p>Using MetaM*sk</p>
        <label className="text-sm font-semibold">ETH Amount:</label>
        <input
          type="text"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          placeholder="ETH amount"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <label className="text-sm font-semibold">Target XCH Address:</label>
        <input
          type="text"
          value={xchAddress}
          onChange={(e) => setXchAddress(e.target.value)}
          placeholder="Target XCH Address"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={sendEthToBridge}
        >Send via MetaMask</button>
      </div>
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">2. Get Message Sent by Portal</label>
        <p>ETH Tx Hash: {ethTxHash === '' ? 'Complete Step 1' : ethTxHash}</p>
        Message data: 
        <textarea disabled={true} value={JSON.stringify(messageData, null, 2)} rows={JSON.stringify(messageData) == '{}' ? 1 : 10} />
        <button
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={fetchEventData}
        >Get Message Details</button>
      </div>
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">3. Fetch Latest Portal Coin</label>
        <p id="coin-id-text">Coin Id: {coinId}</p>
        <p id="nonces-text">Nonces: {JSON.stringify(nonces)}</p>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={fetchPortalInfo}
        >Fetch Latest Portal Coin</button>
      </div>
      <form onSubmit={handleOfferSubmit} className="flex flex-col space-y-4 w-full">
        <label htmlFor="offer" className="block text-lg font-semibold">4. Create & Submit Offer</label>
        <input
          id="offer"
          type="text"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Enter your offer"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button type="submit" className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Submit</button>
      </form>
    </main>
  );
}
