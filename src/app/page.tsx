"use client";
import Image from "next/image";
import { useState } from 'react';
import { findLatestPortalState } from '../util/portal_receiver';  
import { BRIDGE_CONTRACT_ABI, BRIDGE_CONTRACT_ADDRESS } from "@/util/bridge";
import { ethers } from "ethers";
import * as GreenWeb from 'greenwebjs';
import { offerToSpendBundle } from "@/util/offer";
import { mintCATs } from "@/util/mint";
import { getCoinRecordByName, getPuzzleAndSolution } from "@/util/rpc";

export default function Home() {
  const [ethAmount, setEthAmount] = useState('0.003');
  const [xchAddress, setXchAddress] = useState('txch1ak7dup645fr562t2u9rs30d60qh9t89nyxvezwpkd5v29m62z6aqwmmxge');
  const [ethTxHash, setEthTxHash] = useState('0x5934d816452a09fec6cbdbc35eb9bc0d05b115f3baf06985378bb49a1ac14063');
  const [messageData, setMessageData] = useState({});
  const [coinId, setCoinId] = useState('click button below');
  const [nonces, setNonces] = useState({});
  const [offer, setOffer] = useState('offer1qqr83wcuu2rykcmqvps8ennjuyr4lnaw6zkw2736tu0swhh430v46vlthzp0uwun0cmt6mvf0adzyaal067jmzwpvnfsf3lw4kde2eclzf2lnm0fktatn2ku3tacevmkq0xjsa3alngqlhjwrhh88hrqsvmlfl7evrcnq74dl07xtd28gkt0xllyuxth7e9wh3natfmn9kxkuzadae0sm8krtjn8ye77gkxm392j80l74q94xeqf9hhlqhnl0hmmr03m86y79hm40pva577m096cn88taarvv8ru2ww0all4r08ulslhxq6ct4secplmf8my7yfka9cehl3gkj5dm7ltmz6nm6jtunuh4qughhhel307dukl9nheacx4gm8jh727z47c9vrzp5lxlupyh6tefkukzl6w4vn5c5lt8zlk42nlhklg4hxpav8jaztnlxeja24jqjrasr8x75nj7h3l0h2m0tt7dmjre6e0fmve0as60mllglmm6ht0pgxvqmwajajwfjalyh00ay5tkfv9dgj7lcfwadut8uvy7d9m74206azhw042lr8rze7khm938wc0nh3vk983ng7rxa73970uw5u48rp47278g5745lqfqqdysnhg57j6nq');
  const [sig, setSig] = useState('');

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

    const eventSignature = ethers.id("MessageSent(bytes32,address,bytes3,bytes32,bytes32[])");
    const eventLog = receipt!.logs.filter(log => log.topics[0] === eventSignature)[0];

    console.log({ eventLog });
    const indexedNonce = eventLog.topics[1];
    const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address", "bytes3", "bytes32", "bytes32[]"], // Adjusted for the remaining parameters
        eventLog.data
    );


    /* 
    event MessageSent(
        bytes32 indexed nonce,
        address source,
        bytes3 destination_chain,
        bytes32 destination,
        bytes32[] contents
    );
    */
    setMessageData({
      nonce: indexedNonce,
      source: decodedData[0],
      destination_chain: decodedData[1],
      destination: decodedData[2],
      contents: decodedData[3]
    })
  };

  const fetchPortalInfo = async () => {
    const { coinId, nonces } = await findLatestPortalState();
    setCoinId(coinId);
    setNonces(nonces);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const portalCoinRecord = await getCoinRecordByName(coinId);
    const portalParentSpend = await getPuzzleAndSolution(portalCoinRecord.coin.parent_coin_info, portalCoinRecord.confirmed_block_index);
    mintCATs(
      messageData,
      portalCoinRecord,
      portalParentSpend,
      nonces,
      [], // todo
      offer,
      [sig],
      [true, false, false], // todo
      "657468", // eth
      process.env.NEXT_PUBLIC_BRIDGE_ADDRESS!.slice(2)
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center pr-48 pl-48 pt-16 pb-8">
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
        <p>You should be offering {(ethers.parseEther(ethAmount) / ethers.parseEther("0.001")).toString()} mojos and a decent fee.</p>
        <input
          id="offer"
          type="text"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Enter your offer"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <input
          id="sig"
          type="text"
          value={sig}
          onChange={(e) => setSig(e.target.value)}
          placeholder="Enter validator sig"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button type="submit" className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Submit</button>
      </form>
    </main>
  );
}
