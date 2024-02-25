"use client";
import Image from "next/image";
import { useState } from 'react';
import { findLatestPortalState } from '../util/portal_receiver';  
import { BRIDGE_CONTRACT_ABI, BRIDGE_CONTRACT_ADDRESS } from "@/util/bridge";
import { ethers } from "ethers";
import * as GreenWeb from 'greenwebjs';
import { offerToSpendBundle } from "@/util/offer";
import { mintCATs, sbToString } from "@/util/mint";
import { getCoinRecordByName, getPuzzleAndSolution, pushTx } from "@/util/rpc";
import { initializeBLS } from "clvm";

export default function Home() {
  const [ethAmount, setEthAmount] = useState('0.069');
  const [xchAddress, setXchAddress] = useState('txch1s2s3jj6nc2s2aad73wlh3ghvsa2yp7njmcpzxvm0uw3p4gaalkxs3matt5');
  const [ethTxHash, setEthTxHash] = useState('0xfbc705e7e7a123e84ffed4535ad69e1e8991659cda785b5b95c75c3ccc6ac5a2');
  const [messageData, setMessageData] = useState({});
  const [coinId, setCoinId] = useState('click button below');
  const [nonces, setNonces] = useState({});
  const [lastUsedChainAndNonces, setLastUsedChainAndNonces] = useState([]);
  const [blsInitialized, setBlsInitialized] = useState(false);
  const [offer, setOffer] = useState('offer1qqr83wcuu2rykcmqvpswfe0amzu43ft5eyx2rk349llle0tujteenl0r4uaugu3mtvh63tkfhpv0mp3h4lcd89sr08dmjn4lzfk0fyps0wsvmxqnt4smp7tedlgt7ye8s9npfp8d27tgrd6nsla3cd7cuqxnh0ghakdev677epwms6xps7dh5esz9ygec4autv0m7vm3x6xelwxhm8zzzkhqayuu02mztkrj00ae544qm4k6qpyh4lchnn0hlmmd3n86y7akm3032a577m09ucn98taa9vu9r5t7w09llarlruhnl7hq6cr4anr9hnghdq6zehtm2cu6gfla9tmkanl2ufk7rzuanur6jla0pft0d7wlng0exct3rk5d3erl90p6lvzhp3q2dn0lq4v4jqk9dn2kuhazwmkk2duluh7mpuwwz35mux8lddfh0awkmyh5uq9m5ksln79pmt3ax7t6j337ey5wn6u748075ne0tqamm7al597987h8kw09hzmdn6l93tyumhsl972v20lx8k5vzk4hvhrahra020hs48hn0plj7wlflmx52dahmnupy6eaulefnn0dhg4g526ud4mhywpwmma93l04670tqxqq65v4q2g0tzfg5');
  const [sig, setSig] = useState('r1v46xs7rrdqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqyrfgye3-c1nhtr5984fvx795ptys3cd40l69j8yqkf3twggc6d0ysnnqgkmvpqhtan0m-s140kru0nnkne4j6l78qqqchmfvpwf4h5sy0cdkq3nqm4t2xgm4gpa0ye6qycga94f2d48sw0x7qudyp0jexx7z9phj86872a4yfzm2mzw3q6gplg45cr7l5mne5s75vf0rks9p456jzjmkgavh6s3z308u564f99j');
  const [sb, setSb] = useState({});
  const [pushTxStatus, setPushTxStatus] = useState('click button below');

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
    const { coinId, nonces, lastUsedChainAndNonces } = await findLatestPortalState();
    setCoinId(coinId);
    setNonces(nonces);
    setLastUsedChainAndNonces(lastUsedChainAndNonces);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const portalCoinRecord = await getCoinRecordByName(coinId);
    const portalParentSpend = await getPuzzleAndSolution(portalCoinRecord.coin.parent_coin_info, portalCoinRecord.confirmed_block_index);
    const sb = mintCATs(
      messageData,
      portalCoinRecord,
      portalParentSpend,
      nonces,
      lastUsedChainAndNonces,
      offer,
      [sig],
      [true, false, false], // todo
      "657468", // eth
      process.env.NEXT_PUBLIC_BRIDGE_ADDRESS!.slice(2)
    );

    console.log({ sb })

    setSb(sb);
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
        <textarea disabled={true} value={JSON.stringify(nonces, null, 2)} rows={JSON.stringify(nonces) == '{}' ? 1 : (JSON.stringify(nonces, null, 2).match(/\n/g) || []).length + 1} />
        <textarea disabled={true} value={JSON.stringify(lastUsedChainAndNonces, null, 2)} rows={JSON.stringify(lastUsedChainAndNonces) == '{}' ? 1 : (JSON.stringify(lastUsedChainAndNonces, null, 2).match(/\n/g) || []).length + 1} />
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={fetchPortalInfo}
        >Fetch Latest Portal Coin</button>
      </div>
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">4. Initialize BLS Module</label>
        <p>BLS Initialized: {blsInitialized ? 'Yes' : 'No'}</p>
        <button
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={async () => {
            await initializeBLS();
            setBlsInitialized(true);
          }}
        >Initialize BLS</button>
      </div>
      <form onSubmit={handleOfferSubmit} className="flex flex-col space-y-4 w-full pb-16">
        <label htmlFor="offer" className="block text-lg font-semibold">5. Create & Submit Offer</label>
        <p>You should be offering {(ethers.parseEther(ethAmount) / ethers.parseEther("0.001")).toString()} mojos and a decent fee.</p>
        <p>chia rpc wallet create_offer_for_ids {"'"}{'{"offer":{"1":-' + (ethers.parseEther(ethAmount) / ethers.parseEther("0.001")).toString() + '},"fee":4200000000,"driver_dict":{},"validate_only":false}'}{"'"}</p>
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
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">6. Broadcast Spendbundle</label>
        <p>SpendBundle available: {JSON.stringify(sb).length == 2 ? 'No' : 'Yes'}</p>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          disabled={JSON.stringify(sb).length == 2}
          onClick={() => {
            navigator.clipboard.writeText(sbToString(sb));
            alert('SpendBundle copied to clipboard!');
          }}
        >Copy SpendBundle to Clipboard</button>
        <textarea disabled={true} value={pushTxStatus} rows={(pushTxStatus.match(/\n/g) || []).length + 1} />
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={async () => {
            const res = await pushTx(sb);
            setPushTxStatus(JSON.stringify(res, null, 2));
          }}
          disabled={JSON.stringify(sb).length == 2}
        >Push Tx</button>
      </div>
    </main>
  );
}
