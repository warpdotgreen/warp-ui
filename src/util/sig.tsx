import * as GreenWeb from 'greenwebjs';
import { bech32m } from "bech32";
import { SimplePool } from 'nostr-tools/pool'

const RELAYS = [
  "wss://relay.fireacademy.io"
];

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

  console.log({ parts })

  return [originChain, destinationChain, nonce, coinId, sigData];
}

export function stringToHex(str: string): string {
    return str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

export async function getSigs(
  sourceChainHex: string,
  destinationChainHex: string,
  nonce: string,
  coinId: string | null
): Promise<string[]> {
  const routingDataBuff = Buffer.from(sourceChainHex + destinationChainHex + nonce.replace("0x", ""), "hex");
  const routingData = bech32m.encode("r", bech32m.toWords(routingDataBuff));
  var coinData = "";
  if(coinId !== null) {
    coinData = GreenWeb.util.address.puzzleHashToAddress(coinId, "c");
  }

  const pool = new SimplePool();
  const events = await pool.querySync(
    RELAYS,
    {
      kinds: [1],
      "#c": [coinData],
      "#r": [routingData]
    }
  )

  if(events.length === 0) {
    return [];
  }

  return events.map((event) => routingData + "-" + coinData + "-" + event.content);
}
