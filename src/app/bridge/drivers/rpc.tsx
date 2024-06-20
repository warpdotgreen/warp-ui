import * as GreenWeb from 'greenwebjs';
import { parse, stringify } from 'lossless-json'

export function sbToJSON(sb: any): any {
  return {
    coin_spends: sb.coinSpends.map((coinSpend: any) => ({
      coin: {
        parent_coin_info: "0x" + coinSpend.coin.parentCoinInfo.replace("0x", ""),
        puzzle_hash: "0x" + coinSpend.coin.puzzleHash.replace("0x", ""),
        amount: BigInt(coinSpend.coin.amount.toString(10))
      },
      puzzle_reveal: "0x" + GreenWeb.util.sexp.toHex(coinSpend.puzzleReveal),
      solution: "0x" + GreenWeb.util.sexp.toHex(coinSpend.solution)
    })),
    aggregated_signature: "0x" + sb.aggregatedSignature
  };
}

// allows debugging via mixch.dev
export function sbToString(sb: any): any {
  return stringify(sbToJSON(sb));

}

export async function getCoinRecordByName(rpcBaseUrl: string, coinName: string) {
  const res = await fetch(`${rpcBaseUrl}/get_coin_record_by_name`, {
    method: "POST",
    body: JSON.stringify({ name: coinName }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const t = await res.text();
  return (parse(t) as any).coin_record;
}

export async function getPuzzleAndSolution(rpcBaseUrl: string, coinId: string, spentBlockIndex: number) {
  const res = await fetch(`${rpcBaseUrl}/get_puzzle_and_solution`, {
    method: "POST",
    body: stringify({ coin_id: coinId, height: spentBlockIndex }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const t = await res.text();
  return (parse(t) as any).coin_solution;
}

export async function pushTx(rpcBaseUrl: string, sb: any): Promise<any> {
  const res = await fetch(`${rpcBaseUrl}/push_tx`, {
    method: "POST",
    body: stringify({ spend_bundle: sbToJSON(sb) }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const j = await res.json();
  return j;
}

export async function getCoinRecordsByPuzzleHash(
  rpcBaseUrl: string,
  puzzleHash: string,
): Promise<any> {
  const res = await fetch(`${rpcBaseUrl}/get_coin_records_by_puzzle_hash`, {
    method: "POST",
    body: stringify({ puzzle_hash: puzzleHash }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  return (parse(text) as any).coin_records;
}

export async function getBlockchainState(
  rpcBaseUrl: string,
): Promise<any> {
  const res = await fetch(`${rpcBaseUrl}/get_blockchain_state`, {
    method: "POST",
    body: stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const t = await res.text();
  return (parse(t) as any).blockchain_state;
}

export async function getMempoolItemsByCoinName(
  rpcBaseUrl: string,
  coinName: string,
): Promise<any[]> {
  const res = await fetch(`${rpcBaseUrl}/get_mempool_items_by_coin_name`, {
    method: "POST",
    body: stringify({ coin_name: coinName.startsWith("0x") ? coinName : "0x" + coinName }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const t = await res.text();
  return (parse(t) as any).mempool_items;
}
