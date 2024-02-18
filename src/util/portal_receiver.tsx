import { getCoinRecordByName, getPuzzleAndSolution } from "./rpc";
import * as GreenWeb from 'greenwebjs';

const LATEST_PORTAL_STATE_KEY = "latest-portal-data";

const PORTAL_LAUNCHER_ID = process.env.NEXT_PUBLIC_PORTAL_LAUNCHER_ID;

export async function findLatestPortalState() {
  let {coinId, nonces} = JSON.parse(window.localStorage.getItem(LATEST_PORTAL_STATE_KEY) ?? "{}")
  nonces = nonces ?? {};
  coinId = coinId ?? process.env.NEXT_PUBLIC_PORTAL_BOOTSTRAP_COIN_ID;
  
  var coinRecord = await getCoinRecordByName(coinId);

  while(coinRecord.spent) {
    const puzzleAndSolution = await getPuzzleAndSolution(coinId, coinRecord.spent_block_index);
    const puzzleReveal = GreenWeb.util.sexp.fromHex(puzzleAndSolution.puzzle_reveal.slice(2)); // slice 0x
    const solution = GreenWeb.util.sexp.fromHex(puzzleAndSolution.solution.slice(2)); // slice 0x

    // get CREATE_COIN condition that creates next singleton; calculate coin id
    const [_, conditionDict, __] = GreenWeb.util.sexp.conditionsDictForSolution(
      puzzleReveal, solution, GreenWeb.util.sexp.MAX_BLOCK_COST_CLVM
    );

    var newPh: string | null = null;
    const createCoinConds = conditionDict?.get("33");

    for(var i = 0; i < createCoinConds!.length; i++) {
      if(createCoinConds![i].vars[1] === "01") {
        newPh = createCoinConds![i].vars[0];
        break;
      }
    }

    const uncurried = GreenWeb.util.sexp.uncurry(puzzleReveal);
    if(uncurried !== null && coinRecord.coin.puzzle_hash.slice(2) !== GreenWeb.util.sexp.SINGLETON_LAUNCHER_PROGRAM_HASH) {
      alert("todo: parse spent portal coin to update nonces");
    }

    const newCoin = new GreenWeb.Coin()
    newCoin.parentCoinInfo = coinId;
    newCoin.puzzleHash = newPh!;
    newCoin.amount = 1;

    coinId = GreenWeb.util.coin.getName(newCoin);
    coinRecord = await getCoinRecordByName(coinId);

    break;
  }

  // todo: uncomment this
  // window.localStorage.setItem(LATEST_PORTAL_STATE_KEY, JSON.stringify({coinId, nonces}))

  return {
    coinId,
    nonces
  };
}
