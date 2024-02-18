import { offerToSpendBundle } from "./offer";
import * as GreenWeb from 'greenwebjs';
import { SExp, Tuple } from "clvm";

/*
>>> from chia.wallet.trading.offer import OFFER_MOD
>>> OFFER_MOD.get_tree_hash()
<bytes32: cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7>
>>> 
*/
const OFFER_MOD_HASH = "cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7";

/*
>>> from chia.wallet.puzzles.singleton_top_layer_v1_1 import SINGLETON_MOD_HASH
>>> from chia.wallet.puzzles.singleton_top_layer_v1_1 import SINGLETON_LAUNCHER_HASH
>>> SINGLETON_MOD_HASH.hex()
'7faa3253bfddd1e0decb0906b2dc6247bbc4cf608f58345d173adb63e8b47c9f'
>>> SINGLETON_LAUNCHER_HASH.hex()
'eff07522495060c066f66f32acc2a77e3a3e737aca8baea4d1a64ea4cdc13da9'
*/
const SINGLETON_MOD_HASH = "7faa3253bfddd1e0decb0906b2dc6247bbc4cf608f58345d173adb63e8b47c9f";
const SINGLETON_LAUNCHER_HASH = "eff07522495060c066f66f32acc2a77e3a3e737aca8baea4d1a64ea4cdc13da9";

const MESSAGE_COIN_PUZZLE_MOD = "ff02ffff01ff02ffff03ffff09ff8202bfff2f80ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff82017fffff04ff8202ffffff04ffff0bffff02ffff03ffff09ffff0dff82013f80ffff012080ffff0182013fffff01ff088080ff0180ffff02ffff03ffff09ffff0dff8202bf80ffff012080ffff018202bfffff01ff088080ff0180ff8203bf80ff80808080808080ffff01ff088080ff0180ffff04ffff01ffffff3d46ff473cffff02ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffff04ffff04ff18ffff04ff17ff808080ffff04ffff04ff14ffff04ffff0bff13ffff0bff5affff0bff12ffff0bff12ff6aff0980ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6affff02ff1effff04ff02ffff04ff05ff8080808080ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6aff1b80ffff0bff12ff6aff4a808080ff4a808080ff4a808080ffff010180ff808080ffff04ffff04ff1cffff04ff2fff808080ffff04ffff04ff10ffff04ffff0bff2fff1780ff808080ff8080808080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080"
const PORTAL_RECEIVER_LAUNCHER_ID = process.env.NEXT_PUBLIC_PORTAL_LAUNCHER_ID;

const PORTAL_MOD = "ff02ffff01ff02ffff03ff81bfffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff82013fff80808080ff1780ffff01ff02ff82013fff8201bf80ffff01ff088080ff0180ffff01ff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff2fffff04ffff0bffff0101ff2f80ffff04ffff02ff2effff04ff02ffff04ff82017fff80808080ff808080808080ffff01ff01808080ffff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff82017fffff04ff8202ffff808080808080808080ff0180ffff04ffff01ffffff3302ffff02ffff03ff05ffff01ff0bff7cffff02ff1affff04ff02ffff04ff09ffff04ffff02ff14ffff04ff02ffff04ff0dff80808080ff808080808080ffff016c80ff0180ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffffff0bff5cffff02ff1affff04ff02ffff04ff05ffff04ffff02ff14ffff04ff02ffff04ff07ff80808080ff808080808080ff0bff18ffff0bff18ff6cff0580ffff0bff18ff0bff4c8080ffff02ff3effff04ff02ffff04ff09ffff04ff80ffff04ff0dffff04ff818fffff04ffff02ff2effff04ff02ffff04ffff04ff27ffff04ff82014fffff04ff8202cfffff04ff8205cfffff04ff820bcfff808080808080ff80808080ffff04ffff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff0bffff04ffff0bffff0101ff2780ffff04ffff0bffff0102ffff0bffff0101ff82014f80ffff0bffff0101ff8202cf8080ffff04ffff0bffff0101ff8205cf80ffff04ffff0bffff0101ffff02ff2effff04ff02ffff04ff820bcfff8080808080ff8080808080808080ffff01ff80808080ffff02ffff03ff37ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff37ffff04ff6fff80808080808080ff8080ff018080ff808080808080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff02ffff03ff37ffff01ff02ff3effff04ff02ffff04ff05ffff04ffff10ff0bffff06ffff14ff2fffff0102808080ffff04ff37ffff04ffff05ffff14ff2fffff01028080ffff04ff5fffff04ffff02ffff03ffff09ffff06ffff14ff2fffff01028080ff8080ffff0181bfffff01ff04ffff04ffff0132ffff04ff27ffff04ff5fff80808080ff81bf8080ff0180ff808080808080808080ffff01ff02ffff03ffff15ff05ff0b80ffff01ff0880ffff0181bf80ff018080ff0180ff018080";
const SIGNATURE_THRESHOLD = 1;
const SIGNATURE_PUBKEYS = [
  "b93c773fd448927ad5a77d543aa9a2043dad8ab9d8a8ac505317d6542ffdb1b6b74e9e85e734b8ca8264de49b6231a38",
  "b38dc1238afb47296ea89d57c9355be08fa7cf6e732d9d234f234a20473c8576c1cb851d7e756a75c2af0b7fb3110e30",
  "9796fa4b1fa20600e1ab44f5ff77aec6d48ab27e0af89009f269cb918fa2afd2b4bb00dc2560f643cd7e53d786d69c65"
]

// allows debugging via mixch.dev
function sbToString(sb: any): string {
  return JSON.stringify({
    coin_spends: sb.coinSpends.map((coinSpend: any) => ({
      coin: {
        parent_coin_info: "0x" + coinSpend.coin.parentCoinInfo,
        puzzle_hash: "0x" + coinSpend.coin.puzzleHash,
        amount: parseInt(coinSpend.coin.amount.toString())
      },
      puzzle_reveal: GreenWeb.util.sexp.toHex(coinSpend.puzzleReveal),
      solution: GreenWeb.util.sexp.toHex(coinSpend.solution)
    })),
    aggregated_signature: sb.aggregatedSignature
  });

}

function getSingletonStruct(
  launcher_id: string,
): GreenWeb.clvm.SExp {
  return SExp.to(new Tuple<SExp, SExp>(// SINGLETON_STRUCT
      GreenWeb.util.sexp.bytesToAtom(SINGLETON_MOD_HASH),
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(launcher_id),
          GreenWeb.util.sexp.bytesToAtom(SINGLETON_LAUNCHER_HASH),
      )),
  ));
}

/*
def get_message_coin_puzzle_1st_curry(portal_receiver_launcher_id: bytes32) -> Program:
    return MESSAGE_COIN_MOD.curry(
       (SINGLETON_MOD_HASH, (portal_receiver_launcher_id, SINGLETON_LAUNCHER_HASH))
    )
*/
function getMessageCoinPuzzle1stCurry(
  portal_receiver_launcher_id: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(MESSAGE_COIN_PUZZLE_MOD),
    [
      getSingletonStruct(portal_receiver_launcher_id),
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
    nonce,
    (source_chain, source),
    destination,
    message_hash
  )
*/
function getMessageCoinPuzzle(
  portal_receiver_launcher_id: string,
  source_chain: string,
  source: string,
  nonce: string,
  destination: string,
  message_hash: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    getMessageCoinPuzzle1stCurry(portal_receiver_launcher_id),
    [
      GreenWeb.util.sexp.bytesToAtom(nonce),
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(source_chain),
          GreenWeb.util.sexp.bytesToAtom(source),
      )),
      GreenWeb.util.sexp.bytesToAtom(destination),
      GreenWeb.util.sexp.bytesToAtom(message_hash)
    ]
  );
}

/*
def get_portal_receiver_inner_puzzle(
      launcher_id: bytes32,
      signature_treshold: int,
      signature_pubkeys: list[G1Element],
      update_puzzle_hash: bytes32,
      last_nonces: List[int] = [],
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

function getPortalReceiverInnerPuzzle(
  launcher_id: string,
  signature_treshold: number,
  signature_pubkeys: string[],
  update_puzzle_hash: string,
  last_nonces: string[] = [],
): GreenWeb.clvm.SExp {
  const first_curry = GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(PORTAL_MOD),
    [
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(
            GreenWeb.util.coin.amountToBytes(signature_treshold)
          ),
          SExp.to(signature_pubkeys.map((pubkey) => GreenWeb.util.sexp.bytesToAtom(pubkey)))
      )),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(getMessageCoinPuzzle1stCurry(launcher_id))
      ),
      GreenWeb.util.sexp.bytesToAtom(update_puzzle_hash)
    ]
  );

  return GreenWeb.util.sexp.curry(
    first_curry,
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(first_curry)
      ),
      SExp.to(last_nonces.map((nonce) => GreenWeb.util.sexp.bytesToAtom(nonce)))
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
      (receiver_coin.parent_coin_info, (receiver_coin.puzzle_hash, receiver_coin.amount)),
      (parent_parent_info, parent_inner_puzzle_hash),
      message_coin_id
    ])
*/
function getMessageCoinSolution(
  receiverCoin: any,
  parent_parent_info: string,
  parent_inner_puzzle_hash: string,
  message_coin_id: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    SExp.to(new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(receiverCoin.parentCoinInfo),
        SExp.to(new Tuple<SExp, SExp>(
            GreenWeb.util.sexp.bytesToAtom(receiverCoin.puzzleHash),
            GreenWeb.util.sexp.bytesToAtom(
              GreenWeb.util.coin.amountToBytes(receiverCoin.amount)
            )
        )),
    )),
    SExp.to(new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(parent_parent_info),
        GreenWeb.util.sexp.bytesToAtom(parent_inner_puzzle_hash),
    )),
    GreenWeb.util.sexp.bytesToAtom(message_coin_id)
  ]);
}

/*
def get_sigs_switch(sig_switches: List[bool]) -> int:
   return int(
       "".join(["1" if x else "0" for x in sig_switches])[::-1],
       2
    )
*/
function getSigsSwitch(
  sig_switches: boolean[]
): number {
  return parseInt(
    sig_switches.map((x) => x ? "1" : "0").join("").split("").reverse().join(""),
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
       [messages.nonce for messages in messages],
       [
          [
            get_sigs_switch(msg.validator_sig_switches),
            msg.source_chain,
            msg.source,
            msg.destination,
            msg.message
          ] for msg in messages
       ]
    ])
*/
// BUT we are only doing this for one message :green_heart:
function getPortalReceiverInnerSolution(
  validator_sig_switches: boolean[],
  nonce: string,
  source_chain: string,
  source: string,
  destination: string,
  message: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    0,
    [GreenWeb.util.sexp.bytesToAtom(nonce)],
    [
      [
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(
            getSigsSwitch(validator_sig_switches)
          )
        ),
        GreenWeb.util.sexp.bytesToAtom(source_chain),
        GreenWeb.util.sexp.bytesToAtom(source),
        GreenWeb.util.sexp.bytesToAtom(destination),
        GreenWeb.util.sexp.bytesToAtom(message)
      ]
    ]
  ]);
}

export function mintCATs(
  message: any,
  portalCoinRecord: any,
  portalParentSpend: any,
  nonces: any,
  offer: string,
  sigs: string[]
) {
  const {
    nonce,
    destination_chain,
    destination,
    contents
  } = message;

  const [ethAssetContract, xchReceiverPh, tokenAmount] = contents;
  const tokenAmountInt: number = parseInt(tokenAmount, 16);
  const offer_sb = offerToSpendBundle(offer);

  /* find source coin = coin with OFFER_MOD that will create CAT minter */
  var source_coin = new GreenWeb.Coin();

  for(var i = 0; i < offer_sb.coinSpends.length; ++i) {
    const coinSpend = offer_sb.coinSpends[i];

    var [_, conditionsDict, __] = GreenWeb.util.sexp.conditionsDictForSolution(
      coinSpend.puzzleReveal,
      coinSpend.solution,
      GreenWeb.util.sexp.MAX_BLOCK_COST_CLVM
    );
    var createCoinConds = conditionsDict!.get("33") ?? [];

    for(var j = 0; j < createCoinConds.length; ++j) {
      const cond = createCoinConds[j];

      if(tokenAmount.endsWith(cond.vars[1]) && cond.vars[0] === OFFER_MOD_HASH) {
        source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
        source_coin.puzzleHash = OFFER_MOD_HASH;
        source_coin.amount = tokenAmountInt;
        break;
      }
    }
  }

  /* beign building spend bundle */
  var coin_spends = offer_sb.coinSpends;
  var sigs = [
    offer_sb.aggregatedSignature
  ];

  /* spend portal to create message */
  const portalCoin = portalCoinRecord.coin;

  const portalCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  portalCoinSpend.coin = portalCoin;
  portalCoinSpend.puzzleReveal = portalPuzzle;
  portalCoinSpend.solution = portalSolution;
  coin_spends.push(portalCoinSpend);

  const sb = new GreenWeb.util.serializer.types.SpendBundle();
  sb.coinSpends = coin_spends;
  sb.aggregatedSignature = sigs[0]; // todo
  console.log( sbToString(sb) );
}
