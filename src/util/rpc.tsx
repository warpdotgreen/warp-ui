import { sbToJSON } from "./driver";

const RPC_BASE_URL = process.env.NEXT_PUBLIC_RPC_BASE_URL;

export async function getCoinRecordByName(coinName: string) {
  const res = await fetch(`${RPC_BASE_URL}/get_coin_record_by_name`, {
    method: "POST",
    body: JSON.stringify({ name: coinName }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const j = await res.json();
  return j.coin_record;
}

export async function getPuzzleAndSolution(coinId: string, spentBlockIndex: number) {
  const res = await fetch(`${RPC_BASE_URL}/get_puzzle_and_solution`, {
    method: "POST",
    body: JSON.stringify({ coin_id: coinId, height: spentBlockIndex }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const j = await res.json();
  return j.coin_solution;
}

export async function pushTx(sb: any): Promise<any> {
  const res = await fetch(`${RPC_BASE_URL}/push_tx`, {
    method: "POST",
    body: JSON.stringify({ spend_bundle: sbToJSON(sb) }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const j = await res.json();
  return j;
}
