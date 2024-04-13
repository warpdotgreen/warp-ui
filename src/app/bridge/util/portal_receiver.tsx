import { getCoinRecordByName, getPuzzleAndSolution } from "./rpc";
import * as GreenWeb from 'greenwebjs';
import { Bytes } from "clvm";

const LATEST_PORTAL_STATE_KEY = "latest-portal-data";

export async function findLatestPortalState(rpcUrl: string) {
  console.log({ loc: "findLatestPortalState" }); // todo: debug
  let {coinId, nonces, lastUsedChainAndNonces} = JSON.parse(window.localStorage.getItem(LATEST_PORTAL_STATE_KEY) ?? "{}")
  nonces = nonces ?? {};
  coinId = coinId ?? process.env.NEXT_PUBLIC_PORTAL_BOOTSTRAP_COIN_ID;
  lastUsedChainAndNonces = lastUsedChainAndNonces ?? []
  
  var coinRecord = await getCoinRecordByName(rpcUrl, coinId);
  var last_used_nonces = {};

  while(coinRecord.spent) {
    const puzzleAndSolution = await getPuzzleAndSolution(rpcUrl, coinId, coinRecord.spent_block_index);
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
      const innerSolution = GreenWeb.util.sexp.fromHex(
        GreenWeb.util.sexp.asAtomList(solution)[2]
      );
      
      const usedChainsAndNonces = GreenWeb.util.sexp.asAtomList(
        GreenWeb.util.sexp.fromHex(
          GreenWeb.util.sexp.asAtomList(innerSolution)[1]
        )
      );

      lastUsedChainAndNonces = []
      for(var i = 0; i < usedChainsAndNonces.length; i++) {
        const chainAndNonce = GreenWeb.util.sexp.fromHex(
          usedChainsAndNonces[i]
        );
        const chain = (chainAndNonce.first().as_javascript() as Bytes).hex();
        const nonce = (chainAndNonce.rest().as_javascript() as Bytes).hex();

        lastUsedChainAndNonces.push([chain, nonce]);
        
        if(nonces[chain] === undefined) {
          nonces[chain] = {};
        }
        nonces[chain][nonce] = coinId;
      }
    }

    const newCoin = new GreenWeb.Coin()
    newCoin.parentCoinInfo = coinId;
    newCoin.puzzleHash = newPh!;
    newCoin.amount = 1;

    coinId = GreenWeb.util.coin.getName(newCoin);
    coinRecord = await getCoinRecordByName(rpcUrl, coinId);
  }

  window.localStorage.setItem(LATEST_PORTAL_STATE_KEY, JSON.stringify({coinId, nonces, lastUsedChainAndNonces}))

  return {
    coinId,
    nonces,
    lastUsedChainAndNonces
  };
}
