import * as GreenWeb from 'greenwebjs';
import { SExp, Tuple } from "clvm";

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

export function getSingletonStruct(
  launcherId: string,
): GreenWeb.clvm.SExp {
  return SExp.to(new Tuple<SExp, SExp>(// SINGLETON_STRUCT
      GreenWeb.util.sexp.bytesToAtom(SINGLETON_MOD_HASH),
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(launcherId),
          GreenWeb.util.sexp.bytesToAtom(SINGLETON_LAUNCHER_HASH),
      )),
  ));
}
