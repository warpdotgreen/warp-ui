import * as GreenWeb from 'greenwebjs';
import { bech32m } from "bech32";
import { SimplePool } from 'nostr-tools/pool'
import { NETWORKS, NOSTR_CONFIG } from '../config';

/*
def decode_signature(enc_sig: str) -> Tuple[
    bytes,  # origin_chain
    bytes,  # destination_chain
    bytes,  # nonce
    bytes | None,  # coin_id
    bytes  # sig
]:
    parts = enc_sig.split("-")
    route_data = convertbits(bech32_decode(parts[0])[1], 5, 8, False)
    origin_chain = route_data[:3]
    destination_chain = route_data[3:6]
    nonce = route_data[6:]

    coin_id = convertbits(bech32_decode(parts[1])[1], 5, 8, False)
    sig = convertbits(bech32_decode(parts[-1])[1], 5, 8, False)

    return origin_chain, destination_chain, nonce, coin_id, sig
*/
export function decodeSignature(sig: string): [
  string, // origin_chain
  string, // destination_chain
  string, // nonce
  string, // coin_id
  string // sig
] {
  const parts = sig.split("-");
  const routeData = GreenWeb.util.address.addressToPuzzleHash(parts[0], 64 + 12)
  const originChain = routeData.slice(0, 6);
  const destinationChain = routeData.slice(6, 12);
  const nonce = routeData.slice(12);

  const coinId = parts[1].length > 0 ?  GreenWeb.util.address.addressToPuzzleHash(parts[1]) : "";
  const sigData = GreenWeb.util.address.addressToPuzzleHash(parts[2], 96 * 2)

  return [originChain, destinationChain, nonce, coinId, sigData];
}

export async function getSigsAndSelectors(
  sourceChainHex: string,
  destinationChainHex: string,
  nonce: string,
  coinId: string | null
): Promise<[string[], boolean[]]> {
  const routingDataBuff = Buffer.from(sourceChainHex + destinationChainHex + nonce.replace("0x", ""), "hex");
  const routingData = bech32m.encode("r", bech32m.toWords(routingDataBuff));
  var coinData = "";
  if(coinId !== null) {
    coinData = GreenWeb.util.address.puzzleHashToAddress(coinId, "c");
  }

  const pool = new SimplePool();
  const events = await pool.querySync(
    NOSTR_CONFIG.relays,
    {
      kinds: [1],
      "#c": [coinData],
      "#r": [routingData]
    }
  );

  pool.close(NOSTR_CONFIG.relays);

  if(events.length === 0) {
    return [[], []];
  }

  if(coinId === null) {
    // We're getting sigs for eth; need to order by respective validator hot address
    const destinationNetworkId = hexToString(destinationChainHex);
    const destinationNetwork = NETWORKS.filter((network) => network.id === destinationNetworkId)[0];

    const sigStrings = events.sort((a, b) => {
        const indexA = NOSTR_CONFIG.validatorKeys.findIndex(key => key === a.pubkey);
        const indexB = NOSTR_CONFIG.validatorKeys.findIndex(key => key === b.pubkey);

        const addressA = destinationNetwork.validatorInfos[indexA].replace('0x', '').toLowerCase();
        const addressB = destinationNetwork.validatorInfos[indexB].replace('0x', '').toLowerCase();

        const intA = BigInt('0x' + addressA);
        const intB = BigInt('0x' + addressB);

        return intA < intB ? -1 : (intA > intB ? 1 : 0);
    }).map((event) => routingData + "-" + coinData + "-" + event.content);

    return [
      sigStrings,
      [] // selectors
    ]
  }

  // We're getting sigs for XCH
  // Order doesn't matter but we need to generate the 'selectors' array
  const sigStrings = events.map((event) => routingData + "-" + coinData + "-" + event.content);

  const pubkeys = events.map((event) => event.pubkey);
  const selectors = NOSTR_CONFIG.validatorKeys.map((validatorInfo) => pubkeys.includes(validatorInfo));

  return [
    sigStrings,
    selectors
  ];
}
