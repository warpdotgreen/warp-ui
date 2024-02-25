"use client";
import { BRIDGING_FEE_MOJOS, getBurnSendAddress, sbToString } from "@/util/driver";
import { pushTx } from "@/util/rpc";
import { ethers } from "ethers";
import { useState } from "react";

export default function FromChia() {
  const [ethAddress, setEthAddress] = useState("0x113f132a978B7679Aa72c02B0234a32569507043");
  const [ethTokenAddress, setEthTokenAddress] = useState("0x7b79995e5f793a07bc00c21412e50ecae098e7f9");
  const [tokenAmountStr, setTokenAmounStr] = useState("0.001");
  const [offer, setOffer] = useState("offer1qqr83wcuu2rykcmqvpsde3fue94cyhhrmlgvk3hhj3tta6t9t0cdj47m3pjun3ls0w4na38mh5lu4jkvug0lwc0z4jf3delndt2n04pmdm8l7v8duwjskm4w9jmh20kgqrxusthxn8sqvma8pmmnjm4scydm4am6res838elc7cw3t62dqx5hj9jvjxjaf77k5fuu9n69vwffatwl07y9p6h63rdfm7sx72mw4w6nd8c8dfkgzfdalc9ulma77cmuwe7383d7atct8d8hkmewkyee6l0gmrpclznnnl0lagmel8u079lttynyrj5pdw8534rwundh9fdm0drd0yhv7e45xk305mw23743an2l02tpeftnpwlflahvmv54ht3qu4rd7wletczhmq4qwgxnumlc8gs8rskl77dydzhm726ahnpkzj47jne7x8e757yhazdh3llf4uwrhsdp664tactj2ut0d9skr0d7mpmk952rhfe97j44fmfu897hacajv2h3uf0aralg5mu6uh9mtqgkfupmwdzf2j4a2yyd9nu8qugm9vuujllfum2a0044kh8fvw9puccjx5av0dsauuunv7yj45hhdeaawsvjl8y2n6hn94hjqsqasj5mtqdzserz");
  const [sb, setSb] = useState({});
  const [pushTxStatus, setPushTxStatus] = useState("push tx response will be here");

  const getChiaSendAddress = () => {
    if (!ethAddress || !ethTokenAddress) return "";

    return getBurnSendAddress(
        "657468", // eth
        process.env.NEXT_PUBLIC_BRIDGE_ADDRESS!.slice(2),
        ethTokenAddress,
        ethAddress,
        "txch"
      );
  }

  const offerAmount = BRIDGING_FEE_MOJOS - Math.ceil(parseFloat(tokenAmountStr) * 1000);

  const createSpendBundle = async () => {
    alert("Create sb!")
  }

  return (
    <main className="flex min-h-screen flex-col items-center pr-48 pl-48 pt-16 pb-8">
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">1. Send wrapped tokens to address</label>
        <p>ETH Address:</p>
        <input
          type="text"
          value={ethAddress}
          onChange={(e) => setEthAddress(e.target.value)}
          placeholder="ETH Address"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <p>Token Contract Address on ETH (e.g., WETH Address):</p>
        <input
          type="text"
          value={ethTokenAddress}
          onChange={(e) => setEthTokenAddress(e.target.value)}
          placeholder="ETH Token Contract Address"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <p>Predicted address:</p>
        <p>
          {getChiaSendAddress()}
        </p>
        <p>Token Amount:</p>
        <input
          type="text"
          value={tokenAmountStr}
          onChange={(e) => setTokenAmounStr(e.target.value)}
          placeholder="Token Amount"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <p>Command (assumes wallet id 2 holds the token):</p>
        <p>chia wallet send -a {tokenAmountStr} -m 0.0042 -t {getChiaSendAddress()} -i 2 --override</p>
      </div>
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">2. Upload offer</label>
        <p>First, wait for tx to be confirmed. Then use this command to generate an offer:</p>
        <p>chia rpc wallet create_offer_for_ids {"'"}{'{"offer":{"1":-' + (offerAmount).toString() + '},"fee":4200000000,"driver_dict":{},"validate_only":false}'}{"'"}</p>
        <input
          type="text"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="offer1..."
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={createSpendBundle}
        >Create Spend Bundle</button>
      </div>

      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">3. Broadcast Spendbundle</label>
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
