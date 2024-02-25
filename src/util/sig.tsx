import * as GreenWeb from 'greenwebjs';


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
