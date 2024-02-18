import { getCoinRecordByName, getPuzzleAndSolution } from "./rpc";
import * as GreenWeb from 'greenwebjs';

const LATEST_PORTAL_STATE_KEY = "latest-portal-data";

const PORTAL_LAUNCHER_ID = process.env.NEXT_PUBLIC_PORTAL_LAUNCHER_ID;

export async function findLatestPortalState() {
  let {coinId, nonces} = JSON.parse(window.localStorage.getItem(LATEST_PORTAL_STATE_KEY) ?? "{}")
  nonces = nonces ?? [];
  coinId = coinId ?? process.env.NEXT_PUBLIC_PORTAL_BOOTSTRAP_COIN_ID;
  
  const coinRecord = await getCoinRecordByName(coinId);

  while(coinRecord.spent) {
    const puzzleAndSolution = await getPuzzleAndSolution(coinId, coinRecord.spent_block_index);
    console.log({ puzzleAndSolution })
    console.log({ GreenWeb })
    
    break;
  }

  window.localStorage.setItem(LATEST_PORTAL_STATE_KEY, JSON.stringify({coinId, nonces}))

  return {
    coinId,
    nonces
  };
}
