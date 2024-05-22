import * as GreenWeb from 'greenwebjs';
import { getSingletonStruct, SINGLETON_LAUNCHER_HASH } from './singleton';
import { SExp, Tuple, Bytes, getBLSModule } from "clvm";
import { Network, TESTNET } from '../config';
import { ConditionOpcode } from "greenwebjs/util/sexp/condition_opcodes";
import { getCoinRecordByName, getMempoolItemsByCoinName, getPuzzleAndSolution } from './rpc';
import { bech32m } from "bech32";
import { SimplePool } from 'nostr-tools/pool'
import { NETWORKS, NOSTR_CONFIG } from '../config';
import { hexToString } from './util';
import { ethers } from 'ethers';

export const MESSAGE_COIN_PUZZLE_MOD = "ff02ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff82017fffff04ff8202ffffff04ffff0bffff02ffff03ffff09ffff0dff82013f80ffff012080ffff0182013fffff01ff088080ff0180ffff02ffff03ffff09ffff0dff2f80ffff012080ffff012fffff01ff088080ff0180ff8201bf80ff80808080808080ffff04ffff01ffffff3d46ff473cffff02ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffff04ffff04ff18ffff04ff17ff808080ffff04ffff04ff14ffff04ffff0bff13ffff0bff5affff0bff12ffff0bff12ff6aff0980ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6affff02ff1effff04ff02ffff04ff05ff8080808080ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6aff1b80ffff0bff12ff6aff4a808080ff4a808080ff4a808080ffff010180ff808080ffff04ffff04ff1cffff04ff2fff808080ffff04ffff04ff10ffff04ffff0bff2fff1780ff808080ff8080808080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080"

/*
>>> from drivers.portal import BRIDGING_PUZZLE_HASH
>>> BRIDGING_PUZZLE_HASH.hex()
'a09eb1ea8c6e83c0166801dabcf4a70d361cc7f6d89c4a46bcd400ac57719037'
>>> 
*/
export const BRIDGING_PUZZLE = "ff02ffff01ff04ffff04ff04ffff04ff05ff808080ffff04ffff04ff06ffff04ff05ff808080ff808080ffff04ffff01ff4934ff018080";
export const BRIDGING_PUZZLE_HASH = "a09eb1ea8c6e83c0166801dabcf4a70d361cc7f6d89c4a46bcd400ac57719037";

export const PORTAL_MOD = "ff02ffff01ff02ffff03ff81bfffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff82013fff80808080ff1780ffff01ff02ff82013fff8201bf80ffff01ff088080ff0180ffff01ff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff2fffff04ffff0bffff0101ff2f80ffff04ffff02ff2effff04ff02ffff04ff82017fff80808080ff808080808080ffff01ff01808080ffff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff82017fffff04ff8202ffff808080808080808080ff0180ffff04ffff01ffffff3302ffff02ffff03ff05ffff01ff0bff7cffff02ff1affff04ff02ffff04ff09ffff04ffff02ff14ffff04ff02ffff04ff0dff80808080ff808080808080ffff016c80ff0180ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffffff0bff5cffff02ff1affff04ff02ffff04ff05ffff04ffff02ff14ffff04ff02ffff04ff07ff80808080ff808080808080ff0bff18ffff0bff18ff6cff0580ffff0bff18ff0bff4c8080ffff02ff3effff04ff02ffff04ff09ffff04ff80ffff04ff0dffff04ff818fffff04ffff02ff2effff04ff02ffff04ffff04ff47ffff04ff67ffff04ff82014fffff04ff8202cfffff04ff8205cfff808080808080ff80808080ffff04ffff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff0bffff04ffff0bffff0102ffff0bffff0101ff4780ffff0bffff0101ff678080ffff04ffff0bffff0101ff82014f80ffff04ffff0bffff0101ff8202cf80ffff04ffff0bffff0101ffff02ff2effff04ff02ffff04ff8205cfff8080808080ff8080808080808080ffff01ff80808080ffff02ffff03ff37ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff37ffff04ff6fff80808080808080ff8080ff018080ff808080808080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff02ffff03ff37ffff01ff02ff3effff04ff02ffff04ff05ffff04ffff10ff0bffff06ffff14ff2fffff0102808080ffff04ff37ffff04ffff05ffff14ff2fffff01028080ffff04ff5fffff04ffff02ffff03ffff09ffff06ffff14ff2fffff01028080ff8080ffff0181bfffff01ff04ffff04ffff0132ffff04ff27ffff04ff5fff80808080ff81bf8080ff0180ff808080808080808080ffff01ff02ffff03ffff15ff05ff0b80ffff01ff0880ffff0181bf80ff018080ff0180ff018080";
export const P2_M_OF_N_DELEGATE_DIRECT_MOD = "ff02ffff01ff02ffff03ffff09ff05ffff02ff16ffff04ff02ffff04ff17ff8080808080ffff01ff02ff0cffff04ff02ffff04ffff02ff0affff04ff02ffff04ff17ffff04ff0bff8080808080ffff04ffff02ff1effff04ff02ffff04ff2fff80808080ffff04ff2fffff04ff5fff80808080808080ffff01ff088080ff0180ffff04ffff01ffff31ff02ffff03ff05ffff01ff04ffff04ff08ffff04ff09ffff04ff0bff80808080ffff02ff0cffff04ff02ffff04ff0dffff04ff0bffff04ff17ffff04ff2fff8080808080808080ffff01ff02ff17ff2f8080ff0180ffff02ffff03ff05ffff01ff02ffff03ff09ffff01ff04ff13ffff02ff0affff04ff02ffff04ff0dffff04ff1bff808080808080ffff01ff02ff0affff04ff02ffff04ff0dffff04ff1bff808080808080ff0180ff8080ff0180ffff02ffff03ff05ffff01ff10ffff02ff16ffff04ff02ffff04ff0dff80808080ffff02ffff03ff09ffff01ff0101ff8080ff018080ff8080ff0180ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";

/*
def get_message_coin_puzzle_1st_curry(portal_receiver_launcher_id: bytes32) -> Program:
    return MESSAGE_COIN_MOD.curry(
       (SINGLETON_MOD_HASH, (portal_receiver_launcher_id, SINGLETON_LAUNCHER_HASH))
    )
*/
export function getMessageCoinPuzzle1stCurry(
  portalReceiverLauncherId: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(MESSAGE_COIN_PUZZLE_MOD),
    [
      getSingletonStruct(portalReceiverLauncherId),
    ]
  );
}

/*
def get_message_coin_puzzle(
    portal_receiver_launcher_id: bytes32,
    source_chain: bytes,
    source: bytes32,
    nonce: int,
    destination: bytes32,
    message_hash: bytes32,
) -> Program:
  return get_message_coin_puzzle_1st_curry(portal_receiver_launcher_id).curry(
    (source_chain, nonce),
    source,
    destination,
    message_hash
  )
*/
function getMessageCoinPuzzle(
  portalReceiverLauncherId: string,
  sourceChain: string,
  source: string,
  nonce: string,
  destination: string,
  messageHash: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    getMessageCoinPuzzle1stCurry(portalReceiverLauncherId),
    [
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(sourceChain),
          GreenWeb.util.sexp.bytesToAtom(nonce),
      )),
      GreenWeb.util.sexp.bytesToAtom(source),
      GreenWeb.util.sexp.bytesToAtom(destination),
      GreenWeb.util.sexp.bytesToAtom(messageHash)
    ]
  );
}

/*
def get_portal_receiver_inner_puzzle(
      launcher_id: bytes32,
      signature_treshold: int,
      signature_pubkeys: list[G1Element],
      update_puzzle_hash: bytes32,
      last_chains_and_nonces: List[Tuple[bytes, int]] = [],
) -> Program:
    first_curry = PORTAL_RECEIVER_MOD.curry(
       (signature_treshold, signature_pubkeys), # VALIDATOR_INFO
       get_message_coin_puzzle_1st_curry(launcher_id).get_tree_hash(),
       update_puzzle_hash
    )
    return first_curry.curry(
       first_curry.get_tree_hash(), # SELF_HASH
       last_nonces
    )
*/
export function getPortalReceiverInnerPuzzle(
  launcherId: string,
  signatureTreshold: GreenWeb.BigNumber,
  signaturePubkeys: string[],
  updaterPuzzleHash: string,
  lastChainsAndNonces: [string, string][] = [],
): GreenWeb.clvm.SExp {
  const firstCurry = GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(PORTAL_MOD),
    [
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(
            GreenWeb.util.coin.amountToBytes(signatureTreshold)
          ),
          SExp.to(signaturePubkeys.map((pubkey) => GreenWeb.util.sexp.bytesToAtom(pubkey)))
      )),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(getMessageCoinPuzzle1stCurry(launcherId))
      ),
      GreenWeb.util.sexp.bytesToAtom(updaterPuzzleHash)
    ]
  );

  return GreenWeb.util.sexp.curry(
    firstCurry,
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(firstCurry)
      ),
      SExp.to(lastChainsAndNonces.map((chainAndNonce) => new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(chainAndNonce[0]),
          GreenWeb.util.sexp.bytesToAtom(chainAndNonce[1]),
      )))
    ]
  );
}

/*
def get_message_coin_solution(
    receiver_coin: Coin,
    parent_parent_info: bytes32,
    parent_inner_puzzle_hash: bytes32,
    message_coin_id: bytes32,
) -> Program:
    return Program.to([
      (receiver_coin.parent_coin_info, receiver_coin.amount),
      (parent_parent_info, parent_inner_puzzle_hash),
      message_coin_id
    ])
*/
export function getMessageCoinSolution(
  receiverCoin: any,
  parentParentInfo: string,
  parentInnerPuzzleHash: string,
  messageCoinId: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    SExp.to(new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(receiverCoin.parentCoinInfo),
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(receiverCoin.amount)
        ),
    )),
    SExp.to(new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(parentParentInfo),
        GreenWeb.util.sexp.bytesToAtom(parentInnerPuzzleHash),
    )),
    GreenWeb.util.sexp.bytesToAtom(messageCoinId)
  ]);
}

/*
def get_sigs_switch(sig_switches: List[bool]) -> int:
   return int(
       "".join(["1" if x else "0" for x in sig_switches])[::-1],
       2
    )
*/
export function getSigsSwitch(
  sigSwitches: boolean[]
): number {
  return parseInt(
    sigSwitches.map((x) => x ? "1" : "0").reverse().join(""),
    2
  );
}

/*
def get_portal_receiver_inner_solution(
    messages: List[PortalMessage],
    update_puzzle_reveal: Program | None = None,
    update_puzzle_solution: Program | None = None
) -> Program:
    return Program.to([
       0 if update_puzzle_reveal is None or update_puzzle_solution is None else (update_puzzle_reveal, update_puzzle_solution),
       [(message.source_chain, message.nonce) for message in messages],
       [
          [
            get_sigs_switch(msg.validator_sig_switches),
            msg.source,
            msg.destination,
            msg.message
          ] for msg in messages
       ]
    ])
*/
// BUT we are only doing this for one message :green_heart:
// UPDATE: we are no longer doinf this for one message only :green_heart:
export function getPortalReceiverInnerSolution(
  messageInfos: [RawMessage, number][],
  // validatorSigSwitches: boolean[],
  // nonce: string,
  // sourceChain: string,
  // source: string,
  // destination: string,
  // contents: string[],
): GreenWeb.clvm.SExp {
  return SExp.to([
    0,
    messageInfos.map((msgInfo) => new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(msgInfo[0].sourceChainHex),
        GreenWeb.util.sexp.bytesToAtom(msgInfo[0].nonce),
      ),
    ),
    messageInfos.map((msgInfo) =>
      [
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(
            msgInfo[1]
          )
        ),
        GreenWeb.util.sexp.bytesToAtom(msgInfo[0].sourceHex),
        GreenWeb.util.sexp.bytesToAtom(msgInfo[0].destinationHex),
        msgInfo[0].contents.map(contentPart => GreenWeb.util.sexp.bytesToAtom(contentPart))
      ]
    )
  ]);
}

export function getMOfNDelegateDirectPuzzle(
  keyThreshold: GreenWeb.BigNumber,
  keys: string[]
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(P2_M_OF_N_DELEGATE_DIRECT_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.amountToBytes(keyThreshold)
      ),
      SExp.to(keys.map((key) => GreenWeb.util.sexp.bytesToAtom(key)))
    ]
  );
}

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
  rawMessage: RawMessage,
  coinId: string | null,
  sigLimit: number,
  targetEVMNetwork?: Network
): Promise<[string[], boolean[]]> {
  const routingDataBuff = Buffer.from(rawMessage.sourceChainHex + rawMessage.destinationChainHex + rawMessage.nonce, "hex");
  const routingData = bech32m.encode("r", bech32m.toWords(routingDataBuff));

  var coinData = "";
  if(coinId !== null && coinId.length > 0) {
    coinData = GreenWeb.util.address.puzzleHashToAddress(coinId, "c");
  }

  const relays = [];
  if (TESTNET) {
    relays.push(NOSTR_CONFIG.relays[0]);
  } else {
    relays.push(NOSTR_CONFIG.relays[0]);
    relays.push(NOSTR_CONFIG.relays[1]);
  }
  const remainingRelays = NOSTR_CONFIG.relays.slice(TESTNET ? 1 : 0);
  while (relays.length < 4) {
    const randomIndex = Math.floor(Math.random() * remainingRelays.length);
    relays.push(remainingRelays[randomIndex]);
  }


  const pool = new SimplePool();
  const events = await pool.querySync(
    relays,
    coinData.length > 0 ? {
      kinds: [1],
      "#c": [coinData],
      "#r": [routingData]
    } : {
      kinds: [1],
      "#r": [routingData]
    }
  );

  pool.close(relays);

  if(events.length === 0) {
    console.log("No Nostr events found for this nonce (yet)");
    return [[], []];
  }

  if(coinId === null) {
    // We're getting sigs for eth; need to order by respective validator hot address
    const destinationNetworkId = hexToString(rawMessage.destinationChainHex);
    const destinationNetwork = NETWORKS.filter((network) => network.id === destinationNetworkId)[0];

    let sigStrings = events.filter((e) => 
      NOSTR_CONFIG.validatorKeys.includes(e.pubkey)
    ).filter((sigEvent) => {
      if(targetEVMNetwork === undefined) { return true; }

      const index = NOSTR_CONFIG.validatorKeys.findIndex(key => key === sigEvent.pubkey);
      const address = destinationNetwork.validatorInfos[index];
      const decodedSignature = GreenWeb.util.address.addressToPuzzleHash(sigEvent.content, 96 * 2);

      const v = decodedSignature.slice(0, 1 * 2);
      const r = decodedSignature.slice(1 * 2, 33 * 2);
      const s = decodedSignature.slice(33 * 2, 65 * 2);

      const signature = '0x' + r + s + v;

      const domain: ethers.TypedDataDomain = {
        name: "warp.green Portal",
        version: "1",
        chainId: targetEVMNetwork.chainId!,
        verifyingContract: targetEVMNetwork.portalAddress!,
      };

      const types: Record<string, Array<ethers.TypedDataField>> = {
        Message: [
          { name: "nonce", type: "bytes32" },
          { name: "source_chain", type: "bytes3" },
          { name: "source", type: "bytes32" },
          { name: "destination", type: "address" },
          { name: "contents", type: "bytes32[]" },
        ],
      };

      const messageNotRaw = {
        nonce: '0x' + rawMessage.nonce,
        source_chain: '0x' + rawMessage.sourceChainHex,
        source: '0x' + rawMessage.sourceHex,
        destination: ethers.getAddress('0x' + rawMessage.destinationHex),
        contents: rawMessage.contents.map(c => '0x' + c),
      };

      const recoveredAddress = ethers.verifyTypedData(domain, types, messageNotRaw, signature);

      if(address != recoveredAddress) {
        console.log(`Invalid EVM signature from Nostr: recovered address if ${recoveredAddress}, expected ${address} for pubkey ${sigEvent.pubkey} on chain ${destinationNetworkId}`);
        return false;
      }
      return true;
    }).sort((a, b) => {
        const indexA = NOSTR_CONFIG.validatorKeys.findIndex(key => key === a.pubkey);
        const indexB = NOSTR_CONFIG.validatorKeys.findIndex(key => key === b.pubkey);

        const addressA = destinationNetwork.validatorInfos[indexA].replace('0x', '').toLowerCase();
        const addressB = destinationNetwork.validatorInfos[indexB].replace('0x', '').toLowerCase();

        const intA = BigInt('0x' + addressA);
        const intB = BigInt('0x' + addressB);

        return intA < intB ? -1 : (intA > intB ? 1 : 0);
    }).map((event) => routingData + "-" + coinData + "-" + event.content);

    if(sigStrings.length > sigLimit) {
      sigStrings = sigStrings.slice(0, sigLimit);
    }

    return [
      sigStrings,
      [] // selectors
    ]
  }

  // We're getting sigs for XCH
  // Order doesn't matter but we need to generate the 'selectors' array
  let sigStrings = events
    .filter((e) => NOSTR_CONFIG.validatorKeys.includes(e.pubkey))
    .map((event) => routingData + "-" + (event.tags.find(e => e[0] == 'c')??["", ""])[1] + "-" + event.content)
  if(sigStrings.length > sigLimit) {
    sigStrings = sigStrings.slice(0, sigLimit);
  }

  let pubkeys = events.map((event) => event.pubkey);
  if(pubkeys.length > sigLimit) {
    pubkeys = pubkeys.slice(0, sigLimit);
  }
  
  const selectors = NOSTR_CONFIG.validatorKeys.map((validatorInfo) => pubkeys.includes(validatorInfo));

  return [
    sigStrings,
    selectors
  ];
}

function getInfoFromSolution(
  xchChainHex: string,
  solution: GreenWeb.clvm.SExp
): [RawMessage, number][] {
  const innerSolution = GreenWeb.util.sexp.fromHex(
    GreenWeb.util.sexp.asAtomList(solution)[2]
  );

  
  // chains_and_nonces ; (list (c source_chain_1 nonce1) (c source_chain_2 nonce2) ...)
  const rawChainsAndNonces = GreenWeb.util.sexp.asAtomList(innerSolution)[1].length > 0 ? GreenWeb.util.sexp.asAtomList(
    GreenWeb.util.sexp.fromHex(
      GreenWeb.util.sexp.asAtomList(innerSolution)[1]
    )
  ) : [];
  
  // msg_infos ; (list (list validator_sigs_switch source destination message) ... )
  const rawMessageInfos = GreenWeb.util.sexp.asAtomList(innerSolution)[2].length > 0 ? GreenWeb.util.sexp.asAtomList(
    GreenWeb.util.sexp.fromHex(
      GreenWeb.util.sexp.asAtomList(innerSolution)[2]
    )
  ) : [];

  const usedMessageInfos: [RawMessage, number][] = []
  for(var i = 0; i < rawChainsAndNonces.length; i++) {
    const rawChainAndNonce = GreenWeb.util.sexp.fromHex(
      rawChainsAndNonces[i]
    );

    const sourceChain = (rawChainAndNonce.first().as_javascript() as Bytes).hex();
    const nonce = (rawChainAndNonce.rest().as_javascript() as Bytes).hex();

    const rawMessageInfo = GreenWeb.util.sexp.fromHex(
      rawMessageInfos[i]
    );

    const sigSwitch = rawMessageInfo.first().as_int();
    const source = (rawMessageInfo.rest().first().as_javascript() as Bytes).hex();
    const destination = (rawMessageInfo.rest().rest().first().as_javascript() as Bytes).hex();

    const contents = GreenWeb.util.sexp.asAtomList(
      rawMessageInfo.rest().rest().rest().first()
    ).map((s) => {
      if(s.length < 64) {
        return "0".repeat(64 - s.length) + s;
      }

      return s;
    });

    usedMessageInfos.push([{
      nonce,
      destinationHex: destination,
      destinationChainHex: xchChainHex,
      sourceHex: source,
      sourceChainHex: sourceChain,
      contents: contents
    }, sigSwitch]);
  }

  return usedMessageInfos;
}

function getChainsAndNoncesFromSolution(
  solution: GreenWeb.clvm.SExp
): [string, string][] {
  return getInfoFromSolution("", solution).map(([rawMessage, sigSwitch]) => {
    return [rawMessage.sourceChainHex, rawMessage.nonce];
  });
}

export async function findLatestPortalState(
  rpcUrl: string,
  messageNonce: string,
  messageSourceChainHex: string,
  messageDestinationChainHex: string,
  portalBootstrapCoinId: string
): Promise<PortalInfo> {
  let coinId = portalBootstrapCoinId;
  let lastUsedChainAndNonces: [string, string][] = [];
  
  var coinRecord = await getCoinRecordByName(rpcUrl, coinId);

  while(coinRecord.spent) {
    const puzzleAndSolution = await getPuzzleAndSolution(rpcUrl, coinId, coinRecord.spent_block_index);
    const puzzleReveal = GreenWeb.util.sexp.fromHex(puzzleAndSolution.puzzle_reveal.slice(2)); // slice 0x
    const solution = GreenWeb.util.sexp.fromHex(puzzleAndSolution.solution.slice(2)); // slice 0x

    // get CREATE_COIN condition that creates next singleton; calculate coin id
    const [_, conditionDict, __] = GreenWeb.util.sexp.conditionsDictForSolution(
      puzzleReveal, solution, GreenWeb.util.sexp.MAX_BLOCK_COST_CLVM
    );

    var newPh: string | null = null;
    const createCoinConds = conditionDict?.get("33" as ConditionOpcode);

    for(var i = 0; i < createCoinConds!.length; i++) {
      if(createCoinConds![i].vars[1] === "01") {
        newPh = createCoinConds![i].vars[0];
        break;
      }
    }

    const uncurried = GreenWeb.util.sexp.uncurry(puzzleReveal);
    if(uncurried !== null && coinRecord.coin.puzzle_hash.slice(2) !== GreenWeb.util.sexp.SINGLETON_LAUNCHER_PROGRAM_HASH) {
      lastUsedChainAndNonces = getChainsAndNoncesFromSolution(solution)

      if(lastUsedChainAndNonces.includes([messageSourceChainHex, messageNonce])) {
        return {
          coinId,
          messageCoinAlreadyCreated: true,
          mempoolPendingThings: [],
          mempoolSb: null,
          mempoolSbCost: GreenWeb.BigNumber.from(0),
          mempoolSbFee: GreenWeb.BigNumber.from(0)
        };
      }
    }

    const newCoin = new GreenWeb.Coin()
    newCoin.parentCoinInfo = coinId;
    newCoin.puzzleHash = newPh!;
    newCoin.amount = 1;

    coinId = GreenWeb.util.coin.getName(newCoin);
    coinRecord = await getCoinRecordByName(rpcUrl, coinId);
  }

  const mempoolPendingItems = await getMempoolItemsByCoinName(rpcUrl, coinId);
  let mempoolSb = null;
  let mempoolPendingThings: [RawMessage, number][] = [];
  let mempoolSbCost = GreenWeb.BigNumber.from(0);
  let mempoolSbFee = GreenWeb.BigNumber.from(0);

  if(mempoolPendingItems.length > 0) {
    const mempoolPendingSbRaw = mempoolPendingItems[0].spend_bundle;
    mempoolSbCost = GreenWeb.BigNumber.from(mempoolPendingItems[0].cost);
    mempoolSbFee = GreenWeb.BigNumber.from(mempoolPendingItems[0].fee);

    mempoolSb = new GreenWeb.util.serializer.types.SpendBundle();
    mempoolSb.aggregatedSignature = mempoolPendingSbRaw.aggregated_signature.replace("0x", "");
    mempoolSb.coinSpends = mempoolPendingSbRaw.coin_spends.map((coin_spend: any) => {
      const coin = new GreenWeb.Coin();
      coin.parentCoinInfo = coin_spend.coin.parent_coin_info.replace("0x", "");
      coin.puzzleHash = coin_spend.coin.puzzle_hash.replace("0x", "");
      coin.amount = GreenWeb.BigNumber.from(coin_spend.coin.amount);

      const coinSpend = new GreenWeb.util.serializer.types.CoinSpend();
      coinSpend.coin = coin;
      coinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(coin_spend.puzzle_reveal.replace("0x", ""));
      coinSpend.solution = GreenWeb.util.sexp.fromHex(coin_spend.solution.replace("0x", ""));

      return coinSpend;
    });

    const portalSpend = mempoolSb.coinSpends.find((coinSpend) => GreenWeb.util.coin.getName(coinSpend.coin) === coinId)!;
    mempoolPendingThings = getInfoFromSolution(messageDestinationChainHex, portalSpend.solution);
    console.log({ mempoolPendingThings })
  }

  return {
    coinId,
    messageCoinAlreadyCreated: false,
    mempoolPendingThings,
    mempoolSb,
    mempoolSbCost,
    mempoolSbFee
  };
}


export function messageContentsAsSexp(messageContents: any): GreenWeb.clvm.SExp {
  return SExp.to(messageContents.map((content: string) => GreenWeb.util.sexp.bytesToAtom(
    GreenWeb.util.unhexlify(content)!
  )));
}


export type RawMessage = {
  nonce: string;
  destinationHex: string;
  destinationChainHex: string;
  sourceHex: string;
  sourceChainHex: string;
  contents: string[]
}


export async function receiveMessageAndSpendMessageCoin(
  portalBootstrapId: string,
  network: Network,
  message: RawMessage,
  messageReceiverCoin: InstanceType<typeof GreenWeb.Coin>,
  updateStatus: (status: string) => void
): Promise<[
  InstanceType<typeof GreenWeb.CoinSpend>[], // coin spends
  string[], // sigs
  InstanceType<typeof GreenWeb.Coin>, // message coin
]> {
  const coinSpends = [];

  updateStatus("Fetching portal info...");
  let portalInfo = await findLatestPortalState(
    network.rpcUrl,
    message.nonce,
    message.sourceChainHex,
    message.destinationChainHex,
    portalBootstrapId
  );

  updateStatus(`Collecting signatures (0/${network.signatureThreshold})`);
  let [sigStrings, sigSwitches] = await getSigsAndSelectors(
    message,
    portalInfo.coinId,
    network.signatureThreshold
  );
  if(sigStrings.length > 0) {
    updateStatus(`Collecting signatures (${sigStrings.length}/${network.signatureThreshold})`);
  }

  while(sigStrings.length < network.signatureThreshold) {
    await new Promise(r => setTimeout(r, 10000));

    portalInfo = await findLatestPortalState(
      network.rpcUrl,
      message.nonce,
      message.sourceChainHex,
      message.destinationChainHex,
      portalInfo.coinId
    );

    [sigStrings, sigSwitches] = await getSigsAndSelectors(
      message,
      portalInfo.coinId,
      network.signatureThreshold
    );
    updateStatus(`Collecting signatures (${sigStrings.length}/${network.signatureThreshold})`);
  }

  const sigs = sigStrings.map((sigString) => decodeSignature(sigString)[4]);
  
  updateStatus("Building portal spend...");

  const portalCoinRecord = await getCoinRecordByName(network.rpcUrl, portalInfo.coinId);
  const portalCoin = GreenWeb.util.goby.parseGobyCoin({
    amount: 1,
    parent_coin_info: GreenWeb.util.unhexlify(portalCoinRecord.coin.parent_coin_info),
    puzzle_hash: GreenWeb.util.unhexlify(portalCoinRecord.coin.puzzle_hash)
  })!;

  const portalParentSpend = await getPuzzleAndSolution(
    network.rpcUrl, portalCoin.parentCoinInfo, portalCoinRecord.confirmed_block_index
  );
  const lastUsedChainAndNonces = portalParentSpend.coin.puzzle_hash.slice(2) !== SINGLETON_LAUNCHER_HASH ? getChainsAndNoncesFromSolution(
    GreenWeb.util.sexp.fromHex(portalParentSpend.solution.replace("0x", ""))
  ) : [];

  const updatePuzzle = getMOfNDelegateDirectPuzzle(
    GreenWeb.BigNumber.from(network.multisigThreshold!),
    network.multisigInfos!,
  );

  const portalLauncherId = network.portalLauncherId!;
  const portalInnerPuzzle = getPortalReceiverInnerPuzzle(
    portalLauncherId,
    GreenWeb.BigNumber.from(network.signatureThreshold!),
    network.validatorInfos!,
    GreenWeb.util.sexp.sha256tree(updatePuzzle),
    lastUsedChainAndNonces
  );
  const portalPuzzle = GreenWeb.util.sexp.singletonPuzzle(portalLauncherId, portalInnerPuzzle);

  var portalParentInnerPuzHash = null;
  const parentPuzzle = GreenWeb.util.sexp.fromHex(
    GreenWeb.util.unhexlify(portalParentSpend.puzzle_reveal)!
  );
  if(GreenWeb.util.sexp.sha256tree(parentPuzzle ) !== SINGLETON_LAUNCHER_HASH) {
    const [_, args] = GreenWeb.util.sexp.uncurry(parentPuzzle)!;
    const innerPuzzle = args[1];
    portalParentInnerPuzHash = GreenWeb.util.sexp.sha256tree(innerPuzzle);
  }
  const portalLineageProof = portalParentInnerPuzHash !== null ? SExp.to([
    Bytes.from(portalParentSpend.coin.parent_coin_info, "hex"),
    Bytes.from(portalParentInnerPuzHash, "hex"),
    Bytes.from("01", "hex"),
  ]) : SExp.to([
    Bytes.from(portalParentSpend.coin.parent_coin_info, "hex"),
    Bytes.from("01", "hex"),
  ]);

  const messageInfos: [RawMessage, number][] = portalInfo.mempoolPendingThings;
  messageInfos.push([message, getSigsSwitch(sigSwitches)]);

  const portalInnerSolution = getPortalReceiverInnerSolution(messageInfos);
  const portalSolution = GreenWeb.util.sexp.singletonSolution(
    portalLineageProof,
    1,
    portalInnerSolution
  );

  const portalCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  portalCoinSpend.coin = portalCoin;
  portalCoinSpend.puzzleReveal = portalPuzzle;
  portalCoinSpend.solution = portalSolution;
  coinSpends.push(portalCoinSpend);

  /* spend message coin */
  const messageCoinPuzzle = getMessageCoinPuzzle(
    portalLauncherId,
    message.sourceChainHex,
    GreenWeb.util.unhexlify(message.sourceHex)!,
    message.nonce,
    message.destinationHex,
    GreenWeb.util.sexp.sha256tree(
      messageContentsAsSexp(message.contents)
    )
  );

  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = GreenWeb.util.coin.getName(portalCoinSpend.coin);
  messageCoin.puzzleHash = GreenWeb.util.sexp.sha256tree(messageCoinPuzzle);
  messageCoin.amount = 0;

  const messageCoinSolution = getMessageCoinSolution(
    messageReceiverCoin,
    portalCoin.parentCoinInfo,
    GreenWeb.util.sexp.sha256tree(portalInnerPuzzle),
    GreenWeb.util.coin.getName(messageCoin)
  );

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = messageCoinPuzzle;
  messageCoinSpend.solution = messageCoinSolution;
  coinSpends.push(messageCoinSpend);

  /* if pending, make sure to aggregate the pending spend bundle */
  /* this is what limited tibetswap to 1tx/block for a while */
  /* and no, I have no idea why it took so long to find that bug */
  if(portalInfo.mempoolSb !== null) {
    sigs.push(portalInfo.mempoolSb!.aggregatedSignature);
    portalInfo.mempoolSb!.coinSpends.forEach((coinSpend) => {
      if(GreenWeb.util.coin.getName(coinSpend.coin) !== portalInfo.coinId) {
        coinSpends.push(coinSpend);
      }
    });
  }

  return [
    coinSpends,
    sigs,
    messageCoin
  ]
}

export function getSecurityCoinSig(
  securityCoin: InstanceType<typeof GreenWeb.Coin>,
  conditions: SExp[],
  tempSk: any,
  aggSigAdditionalDataHex: string
): string { // signature
  const { AugSchemeMPL } = getBLSModule();

  // (list AGG_SIG_ME SYNTHETIC_PUBLIC_KEY (sha256tree1 delegated_puzzle))
  const securityDelegatedPuzzle = GreenWeb.util.sexp.run(
      GreenWeb.util.sexp.P2_CONDITIONS_PROGRAM,
      SExp.to([
          SExp.to(conditions),
      ])
  );
  const securityDelegatedPuzzleHash = GreenWeb.util.sexp.sha256tree(securityDelegatedPuzzle);
  const dataToSign = securityDelegatedPuzzleHash + GreenWeb.util.coin.getName(securityCoin) + aggSigAdditionalDataHex;
  const securityCoinSigRaw = AugSchemeMPL.sign(tempSk, Buffer.from(dataToSign, "hex"));
  const securityCoinSig = Buffer.from(
    securityCoinSigRaw.serialize()
  ).toString("hex");

  return securityCoinSig;
}

export function spendOutgoingMessageCoin(
  coinsetNetwork: Network,
  parentCoinInfo: string,
): InstanceType<typeof GreenWeb.CoinSpend> {
  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = parentCoinInfo;
  messageCoin.puzzleHash = BRIDGING_PUZZLE_HASH;
  messageCoin.amount = coinsetNetwork.messageToll!;
  
  const messageCoinSolution = SExp.to([
    messageCoin.amount
  ]);

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(BRIDGING_PUZZLE);
  messageCoinSpend.solution = messageCoinSolution;

  return messageCoinSpend;
}

export async function getMessageSentFromXCHStepThreeData(
  coinsetNetwork: Network,
  nonce: string
): Promise<any> {
  const messageCoinRecord = await getCoinRecordByName(coinsetNetwork.rpcUrl, nonce);
  const messageCoinParentSpend = await getPuzzleAndSolution(
    coinsetNetwork.rpcUrl,
    messageCoinRecord.coin.parent_coin_info,
    messageCoinRecord.confirmed_block_index
  );

  const [_, conditionsDict, __] = GreenWeb.util.sexp.conditionsDictForSolution(
    GreenWeb.util.sexp.fromHex(messageCoinParentSpend.puzzle_reveal.slice(2)),
    GreenWeb.util.sexp.fromHex(messageCoinParentSpend.solution.slice(2)),
    GreenWeb.util.sexp.MAX_BLOCK_COST_CLVM
  )
  var createCoinConds = conditionsDict?.get("33" as ConditionOpcode) ?? [];

  for(var i = 0; i < createCoinConds.length; ++i) {
    const cond = createCoinConds[i];
    if(cond.vars[0] === messageCoinRecord.coin.puzzle_hash.slice(2) &&
       cond.vars[1] === GreenWeb.util.coin.amountToBytes(messageCoinRecord.coin.amount)) {
        const memos = GreenWeb.util.sexp.fromHex(cond.vars[2]);
        
        const destination_chain_id = GreenWeb.util.sexp.toHex(memos.first()).slice(2);
        const destination = GreenWeb.util.sexp.toHex(memos.rest().first()).slice(2);
        
        const contents = GreenWeb.util.sexp.asAtomList(memos.rest().rest()).map((val) => {
          if(val.length === 64) {
            return val;
          }

          return "0".repeat(64 - val.length) + val;
        });

        return {
          sourceNetworkId: coinsetNetwork.id,
          destinationNetworkId: hexToString(destination_chain_id),
          nonce,
          source: messageCoinParentSpend.coin.puzzle_hash.slice(2),
          destination: ethers.getAddress("0x" + destination),
          contents
        };
      }
  }

  return null;
}

export type PortalInfo = {
  coinId: string; // either last spent coin id on-chain or the parent coin id if the message coin was already created
  messageCoinAlreadyCreated: boolean;
  mempoolPendingThings: [RawMessage, number][];
  mempoolSb: InstanceType<typeof GreenWeb.util.serializer.types.SpendBundle> | null;
  mempoolSbCost: GreenWeb.BigNumber;
  mempoolSbFee: GreenWeb.BigNumber;
}

export async function bootstrapPortal(
  currentPortalInfo: PortalInfo | null,
  xchNetwork: Network,
  message: RawMessage,
  updateStatus: (status: string) => void
): Promise<PortalInfo> {
  let bootstrapCoinId = "";

  if(currentPortalInfo === null) {
    updateStatus("Fetching portal bootstrap coin id...");
    let sigStrings: string[] = [];
    let _;
    while(sigStrings.length < 1) {
      [sigStrings, _] = await getSigsAndSelectors(
        message,
        "",
        1
      );
    }
    const [__, ___, ____, coinId, _____] = decodeSignature(sigStrings[0]);
    const coinRecord = await getCoinRecordByName(xchNetwork.rpcUrl, coinId);

    bootstrapCoinId = GreenWeb.util.coin.getName(
      GreenWeb.util.goby.parseGobyCoin({
        amount: 1,
        parent_coin_info: GreenWeb.util.unhexlify(coinRecord.coin.parent_coin_info),
        puzzle_hash: GreenWeb.util.unhexlify(coinRecord.coin.puzzle_hash)
      })!
    );
  } else {
    bootstrapCoinId = currentPortalInfo!.coinId;
  }

  updateStatus("Syncing portal singleton...");
  return await findLatestPortalState(
    xchNetwork.rpcUrl,
    message.nonce,
    message.sourceChainHex,
    message.destinationChainHex,
    bootstrapCoinId
  );
}
