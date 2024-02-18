import { offerToSpendBundle } from "./offer";
import * as GreenWeb from 'greenwebjs';

/*
>>> from chia.wallet.trading.offer import OFFER_MOD
>>> OFFER_MOD.get_tree_hash()
<bytes32: cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7>
>>> 
*/
const OFFER_MOD_HASH = "cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7";

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

export function mintCATs(
  message: any,
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

  /* spend portal */

  const sb = new GreenWeb.util.serializer.types.SpendBundle();
  sb.coinSpends = coin_spends;
  sb.aggregatedSignature = sigs[0]; // todo
  console.log( sbToString(sb) );
}
