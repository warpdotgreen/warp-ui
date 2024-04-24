import { offerToSpendBundle } from "./offer";
import * as GreenWeb from 'greenwebjs';
import { SExp, Tuple, Bytes, getBLSModule } from "clvm";
import { decodeSignature } from "./sig";
import { ConditionOpcode } from "greenwebjs/util/sexp/condition_opcodes";
import { CHIA_NETWORK, Network } from "../config";
import { stringToHex } from "./sig";
import { BigNumberish } from "ethers";

/*
>>> from chia.wallet.trading.offer import OFFER_MOD
>>> OFFER_MOD.get_tree_hash()
<bytes32: cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7>
>>> 
*/
const OFFER_MOD_HASH = "cfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7";

/*
>>> from chia.wallet.trading.offer import OFFER_MOD
>>> bytes(OFFER_MOD).hex()
'ff02ffff01ff02ff0affff04ff02ffff04ff03ff80808080ffff04ffff01ffff333effff02ffff03ff05ffff01ff04ffff04ff0cffff04ffff02ff1effff04ff02ffff04ff09ff80808080ff808080ffff02ff16ffff04ff02ffff04ff19ffff04ffff02ff0affff04ff02ffff04ff0dff80808080ff808080808080ff8080ff0180ffff02ffff03ff05ffff01ff02ffff03ffff15ff29ff8080ffff01ff04ffff04ff08ff0980ffff02ff16ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff01ff088080ff0180ffff010b80ff0180ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080
*/
const OFFER_MOD = "ff02ffff01ff02ff0affff04ff02ffff04ff03ff80808080ffff04ffff01ffff333effff02ffff03ff05ffff01ff04ffff04ff0cffff04ffff02ff1effff04ff02ffff04ff09ff80808080ff808080ffff02ff16ffff04ff02ffff04ff19ffff04ffff02ff0affff04ff02ffff04ff0dff80808080ff808080808080ff8080ff0180ffff02ffff03ff05ffff01ff02ffff03ffff15ff29ff8080ffff01ff04ffff04ff08ff0980ffff02ff16ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff01ff088080ff0180ffff010b80ff0180ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";

/*
>>> from chia.wallet.cat_wallet.cat_wallet import CAT_MOD
>>> bytes(CAT_MOD).hex()
*/
const CAT_MOD = "ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff34ff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff02ff2affff04ff02ffff04ff82027fffff04ff82057fffff04ff820b7fff808080808080ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff3d46ff02ff333cffff0401ff01ff81cb02ffffff20ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff7cffff0bff34ff2480ffff0bff7cffff0bff7cffff0bff34ff2c80ff0980ffff0bff7cff0bffff0bff34ff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ffff22ffff09ffff0dff0580ff2280ffff09ffff0dff0b80ff2280ffff15ff17ffff0181ff8080ffff01ff0bff05ff0bff1780ffff01ff088080ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff56ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ffffff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff5880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff26ffff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff7affff04ff02ffff04ffff02ffff03ffff09ff11ff5880ffff01ff04ff58ffff04ffff02ff76ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff34ff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff7880ffff01ff02ffff03ffff20ffff02ffff03ffff09ffff0121ffff0dff298080ffff01ff02ffff03ffff09ffff0cff29ff80ff3480ff5c80ffff01ff0101ff8080ff0180ff8080ff018080ffff0109ffff01ff088080ff0180ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff5880ffff0159ff8080ff0180ffff04ffff02ff26ffff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffff02ffff03ff05ffff01ff04ff09ffff02ff56ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff7cffff0bff34ff2880ffff0bff7cffff0bff7cffff0bff34ff2c80ff0580ffff0bff7cffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff34ff3480ff8080808080ffff0bff34ff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ffff04ffff04ff30ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff26ffff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff02ff2affff04ff02ffff04ff8204ffffff04ffff02ff76ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff34ff2d80ffff04ff15ff80808080808080ffff04ff8216ffff808080808080ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff5affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff02ff2affff04ff02ffff04ff27ffff04ffff02ff76ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff34ff81b980ffff04ff59ff80808080808080ffff04ff81b7ff80808080808080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff78ffff04ffff0eff5cffff02ff2effff04ff02ffff04ffff04ff2fffff04ff82017fff808080ff8080808080ff808080ffff04ffff04ff20ffff04ffff0bff81bfff5cffff02ff2effff04ff02ffff04ffff04ff15ffff04ffff10ff82017fffff11ff8202dfff2b80ff8202ff80ff808080ff8080808080ff808080ff138080ff80808080808080808080ff018080";

/*
>>> from chia.wallet.cat_wallet.cat_wallet import CAT_MOD_HASH
>>> CAT_MOD_HASH.hex()
*/
const CAT_MOD_HASH = "37bef360ee858133b69d595a906dc45d01af50379dad515eb9518abb7c1d2a7a";

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

const MESSAGE_COIN_PUZZLE_MOD = "ff02ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff82017fffff04ff8202ffffff04ffff0bffff02ffff03ffff09ffff0dff82013f80ffff012080ffff0182013fffff01ff088080ff0180ffff02ffff03ffff09ffff0dff2f80ffff012080ffff012fffff01ff088080ff0180ff8201bf80ff80808080808080ffff04ffff01ffffff3d46ff473cffff02ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffff04ffff04ff18ffff04ff17ff808080ffff04ffff04ff14ffff04ffff0bff13ffff0bff5affff0bff12ffff0bff12ff6aff0980ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6affff02ff1effff04ff02ffff04ff05ff8080808080ffff0bff12ffff0bff7affff0bff12ffff0bff12ff6aff1b80ffff0bff12ff6aff4a808080ff4a808080ff4a808080ffff010180ff808080ffff04ffff04ff1cffff04ff2fff808080ffff04ffff04ff10ffff04ffff0bff2fff1780ff808080ff8080808080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080"

/*
>>> from drivers.portal import BRIDGING_PUZZLE_HASH
>>> BRIDGING_PUZZLE_HASH.hex()
'a09eb1ea8c6e83c0166801dabcf4a70d361cc7f6d89c4a46bcd400ac57719037'
>>> 
*/
const BRIDGING_PUZZLE = "ff02ffff01ff04ffff04ff04ffff04ff05ff808080ffff04ffff04ff06ffff04ff05ff808080ff808080ffff04ffff01ff4934ff018080";
const BRIDGING_PUZZLE_HASH = "a09eb1ea8c6e83c0166801dabcf4a70d361cc7f6d89c4a46bcd400ac57719037";

const PORTAL_MOD = "ff02ffff01ff02ffff03ff81bfffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff82013fff80808080ff1780ffff01ff02ff82013fff8201bf80ffff01ff088080ff0180ffff01ff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff2fffff04ffff0bffff0101ff2f80ffff04ffff02ff2effff04ff02ffff04ff82017fff80808080ff808080808080ffff01ff01808080ffff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff82017fffff04ff8202ffff808080808080808080ff0180ffff04ffff01ffffff3302ffff02ffff03ff05ffff01ff0bff7cffff02ff1affff04ff02ffff04ff09ffff04ffff02ff14ffff04ff02ffff04ff0dff80808080ff808080808080ffff016c80ff0180ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffffff0bff5cffff02ff1affff04ff02ffff04ff05ffff04ffff02ff14ffff04ff02ffff04ff07ff80808080ff808080808080ff0bff18ffff0bff18ff6cff0580ffff0bff18ff0bff4c8080ffff02ff3effff04ff02ffff04ff09ffff04ff80ffff04ff0dffff04ff818fffff04ffff02ff2effff04ff02ffff04ffff04ff47ffff04ff67ffff04ff82014fffff04ff8202cfffff04ff8205cfff808080808080ff80808080ffff04ffff04ffff04ff10ffff04ffff02ff12ffff04ff02ffff04ff0bffff04ffff0bffff0102ffff0bffff0101ff4780ffff0bffff0101ff678080ffff04ffff0bffff0101ff82014f80ffff04ffff0bffff0101ff8202cf80ffff04ffff0bffff0101ffff02ff2effff04ff02ffff04ff8205cfff8080808080ff8080808080808080ffff01ff80808080ffff02ffff03ff37ffff01ff02ff16ffff04ff02ffff04ff05ffff04ff0bffff04ff37ffff04ff6fff80808080808080ff8080ff018080ff808080808080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff02ffff03ff37ffff01ff02ff3effff04ff02ffff04ff05ffff04ffff10ff0bffff06ffff14ff2fffff0102808080ffff04ff37ffff04ffff05ffff14ff2fffff01028080ffff04ff5fffff04ffff02ffff03ffff09ffff06ffff14ff2fffff01028080ff8080ffff0181bfffff01ff04ffff04ffff0132ffff04ff27ffff04ff5fff80808080ff81bf8080ff0180ff808080808080808080ffff01ff02ffff03ffff15ff05ff0b80ffff01ff0880ffff0181bf80ff018080ff0180ff018080";
const P2_M_OF_N_DELEGATE_DIRECT_MOD = "ff02ffff01ff02ffff03ffff09ff05ffff02ff16ffff04ff02ffff04ff17ff8080808080ffff01ff02ff0cffff04ff02ffff04ffff02ff0affff04ff02ffff04ff17ffff04ff0bff8080808080ffff04ffff02ff1effff04ff02ffff04ff2fff80808080ffff04ff2fffff04ff5fff80808080808080ffff01ff088080ff0180ffff04ffff01ffff31ff02ffff03ff05ffff01ff04ffff04ff08ffff04ff09ffff04ff0bff80808080ffff02ff0cffff04ff02ffff04ff0dffff04ff0bffff04ff17ffff04ff2fff8080808080808080ffff01ff02ff17ff2f8080ff0180ffff02ffff03ff05ffff01ff02ffff03ff09ffff01ff04ff13ffff02ff0affff04ff02ffff04ff0dffff04ff1bff808080808080ffff01ff02ff0affff04ff02ffff04ff0dffff04ff1bff808080808080ff0180ff8080ff0180ffff02ffff03ff05ffff01ff10ffff02ff16ffff04ff02ffff04ff0dff80808080ffff02ffff03ff09ffff01ff0101ff8080ff018080ff8080ff0180ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";

/*
>>> from drivers.wrapped_assets import CAT_BURNER_MOD
>>> bytes(CAT_BURNER_MOD).hex()
*/
const CAT_BURNER_MOD = "ff02ffff01ff02ff2affff04ff02ffff04ff825fffffff04ffff0bffff02ffff03ffff09ffff0dff81bf80ffff012080ffff0181bfffff01ff088080ff0180ffff02ff2effff04ff02ffff04ff05ffff04ffff0bffff0101ff0580ffff04ff82017fffff04ffff02ff2effff04ff02ffff04ffff02ff2effff04ff02ffff04ff0bffff04ffff0bffff0101ff822fff80ffff04ffff0bffff0101ff8205ff80ff808080808080ffff04ffff0bffff0101ff820bff80ffff04ffff0bffff0101ff8217ff80ff808080808080ff80808080808080ff8202ff80ffff04ffff04ffff04ff38ffff04ff825fffff808080ffff04ffff04ff28ffff04ff8217ffff808080ffff04ffff04ff14ffff04ff822fffff808080ffff04ffff04ff2cffff04ff17ffff04ff8217ffffff04ffff04ff2fffff04ff5fffff04ff8205ffffff04ff820bffffff04ff8202ffff808080808080ff8080808080ff8080808080ff808080808080ffff04ffff01ffffff3dff4946ff48ff333cffff02ffff04ffff04ff10ffff04ffff0bff0bff0580ff808080ffff04ffff04ff3cffff04ff0bff808080ff178080ff02ffff03ff05ffff01ff0bff76ffff02ff3effff04ff02ffff04ff09ffff04ffff02ff3affff04ff02ffff04ff0dff80808080ff808080808080ffff016680ff0180ffffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffff0bff56ffff02ff3effff04ff02ffff04ff05ffff04ffff02ff3affff04ff02ffff04ff07ff80808080ff808080808080ff0bff12ffff0bff12ff66ff0580ffff0bff12ff0bff468080ff018080";

/*
>>> from drivers.wrapped_assets import CAT_MINTER_MOD
>>> bytes(CAT_MINTER_MOD).hex()
*/
const CAT_MINTER_MOD = "ff02ffff01ff02ff12ffff04ff02ffff04ffff0bffff02ffff03ffff09ffff0dff825fff80ffff012080ffff01825fffffff01ff088080ff0180ffff02ff16ffff04ff02ffff04ff05ffff04ffff0bffff0102ffff0bffff0101ff82017f80ffff0bffff0101ff8205ff8080ffff04ffff0bffff0101ff8202ff80ffff04ffff0bffff0101ff8217ff80ffff04ffff0bffff0101ffff02ff3effff04ff02ffff04ff820bffff8080808080ff8080808080808080ff8080ffff04ff822fffffff04ffff04ffff04ff28ffff04ff822fffff808080ffff04ffff04ff38ffff04ff8217ffff808080ffff04ffff04ff14ffff04ffff02ff16ffff04ff02ffff04ff0bffff04ffff0bffff0101ff0b80ffff04ffff0bffff0101ffff02ff16ffff04ff02ffff04ff17ffff04ffff0bffff0101ff8217ff80ffff04ffff0bffff0101ffff02ff16ffff04ff02ffff04ff81bfffff04ff5fffff04ffff0bffff0101ff8213ff80ff80808080808080ff80808080808080ffff04ffff02ff16ffff04ff02ffff04ff2fffff04ffff0bffff0101ff822bff80ff8080808080ff80808080808080ffff04ffff12ff825bffffff010180ff80808080ff80808080ff808080808080ffff04ffff01ffffff3dff4648ff33ff3c02ffffff04ffff04ff10ffff04ffff0bff05ff0b80ff808080ffff04ffff04ff2cffff04ff05ff808080ff178080ffff02ffff03ff05ffff01ff0bff81faffff02ff2effff04ff02ffff04ff09ffff04ffff02ff2affff04ff02ffff04ff0dff80808080ff808080808080ffff0181da80ff0180ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ffff0bff81baffff02ff2effff04ff02ffff04ff05ffff04ffff02ff2affff04ff02ffff04ff07ff80808080ff808080808080ffff0bff3cffff0bff3cff81daff0580ffff0bff3cff0bff819a8080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff3effff04ff02ffff04ff09ff80808080ffff02ff3effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";

/*
>>> from drivers.wrapped_assets import CAT_MINT_AND_PAYOUT_MOD, CAT_MINT_AND_PAYOUT_MOD_HASH
>>> bytes(CAT_MINT_AND_PAYOUT_MOD).hex()
>>> CAT_MINT_AND_PAYOUT_MOD_HASH.hex()
*/
const CAT_MINT_AND_PAYOUT_MOD = "ff02ffff01ff04ffff04ff04ffff04ff17ff808080ffff04ffff04ff06ffff04ff05ffff04ff17ffff04ffff04ff05ff8080ff8080808080ffff04ffff04ff06ffff04ff80ffff04ffff01818fffff04ff0bffff04ff2fff808080808080ff80808080ffff04ffff01ff4933ff018080";
const CAT_MINT_AND_PAYOUT_MOD_HASH = "2c78140b52765a1c063062775d31a33a452410e9777c01270c1001db6e821f37";

/*
>>> from drivers.wrapped_assets import WRAPPED_TAIL_MOD, WRAPPED_TAIL_MOD_HASH
>>> bytes(WRAPPED_TAIL_MOD).hex()
>>> WRAPPED_TAIL_MOD_HASH.hex()
*/
const WRAPPED_TAIL_MOD = "ff02ffff01ff02ffff03ff2fffff01ff02ffff03ffff22ffff09ffff11ff80ff81bf80ff8202f780ffff09ff47ffff0bff16ffff0bff04ffff0bff04ff1aff0b80ffff0bff04ffff0bff1effff0bff04ffff0bff04ff1aff8204ff80ffff0bff04ffff0bff1effff0bff04ffff0bff04ff1aff8206ff80ffff0bff04ff1aff12808080ff12808080ff128080808080ff80ffff01ff088080ff0180ffff01ff02ffff03ffff22ffff09ff81bfff8080ffff09ffff0dff8202ff80ffff012080ffff09ff81b7ffff0bff8202ffff05ff8202f7808080ff80ffff01ff088080ff018080ff0180ffff04ffff01ff02ffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ff018080";
const WRAPPED_TAIL_MOD_HASH = "2d7e6fd2e8dd27536ebba2cf6b9fde09493fa10037aa64e14b201762c902f013";

/*
>>> from drivers.wrapped_assets import BURN_INNER_PUZZLE_MOD, BURN_INNER_PUZZLE_MOD_HASH
>>> bytes(BURN_INNER_PUZZLE_MOD).hex()
>>> BURN_INNER_PUZZLE_MOD_HASH.hex()
*/
const BURN_INNER_PUZZLE_MOD = "ff02ffff01ff04ffff04ff0cffff04ff81bfff808080ffff04ffff04ff0affff04ff80ffff04ffff01818fffff04ff82017fffff04ffff04ffff0bffff0101ff1780ffff0bffff0101ff2f8080ff808080808080ffff02ff1effff04ff02ffff04ff81bfffff04ffff0bffff02ffff03ffff09ffff0dff5f80ffff012080ffff015fffff01ff088080ff0180ff05ff2f80ff80808080808080ffff04ffff01ffff3d46ff33ff3cff04ffff04ff08ffff04ffff0bff0bff0580ff808080ffff04ffff04ff16ffff04ff0bff808080ff808080ff018080";
const BURN_INNER_PUZZLE_MOD_HASH = "69b9ac68db61a9941ff537cbb69158a7e1015ad44c42cff905159909cd8e1f90";
                                    // nice

export function sbToJSON(sb: any): any {
  return {
    coin_spends: sb.coinSpends.map((coinSpend: any) => ({
      coin: {
        parent_coin_info: "0x" + coinSpend.coin.parentCoinInfo.replace("0x", ""),
        puzzle_hash: "0x" + coinSpend.coin.puzzleHash.replace("0x", ""),
        amount: parseInt(coinSpend.coin.amount.toString())
      },
      puzzle_reveal: GreenWeb.util.sexp.toHex(coinSpend.puzzleReveal),
      solution: GreenWeb.util.sexp.toHex(coinSpend.solution)
    })),
    aggregated_signature: sb.aggregatedSignature
  };
}

// allows debugging via mixch.dev
export function sbToString(sb: any): any {
  return JSON.stringify(sbToJSON(sb));

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
    (source_chain, nonce),
    source,
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
      SExp.to(new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(source_chain),
          GreenWeb.util.sexp.bytesToAtom(nonce),
      )),
      GreenWeb.util.sexp.bytesToAtom(source),
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

function getPortalReceiverInnerPuzzle(
  launcher_id: string,
  signature_treshold: number,
  signature_pubkeys: string[],
  update_puzzle_hash: string,
  last_chains_and_nonces: [string, string][] = [],
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
      SExp.to(last_chains_and_nonces.map((chain_and_nonce) => new Tuple<SExp, SExp>(
          GreenWeb.util.sexp.bytesToAtom(chain_and_nonce[0]),
          GreenWeb.util.sexp.bytesToAtom(chain_and_nonce[1]),
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
function getMessageCoinSolution(
  receiverCoin: any,
  parent_parent_info: string,
  parent_inner_puzzle_hash: string,
  message_coin_id: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    SExp.to(new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(receiverCoin.parentCoinInfo),
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(receiverCoin.amount)
        ),
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
function getPortalReceiverInnerSolution(
  validator_sig_switches: boolean[],
  nonce: string,
  source_chain: string,
  source: string,
  destination: string,
  contents: string[],
): GreenWeb.clvm.SExp {
  return SExp.to([
    0,
    [
      new Tuple<SExp, SExp>(
        GreenWeb.util.sexp.bytesToAtom(source_chain),
        GreenWeb.util.sexp.bytesToAtom(nonce),
      ),
    ],
    [
      [
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(
            getSigsSwitch(validator_sig_switches)
          )
        ),
        GreenWeb.util.sexp.bytesToAtom(source),
        GreenWeb.util.sexp.bytesToAtom(destination),
        contents.map(contentPart => GreenWeb.util.sexp.bytesToAtom(contentPart))
      ]
    ]
  ]);
}

function getMOfNDelegateDirectPuzzle(
  key_threshold: number,
  keys: string[]
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(P2_M_OF_N_DELEGATE_DIRECT_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.amountToBytes(key_threshold)
      ),
      SExp.to(keys.map((key) => GreenWeb.util.sexp.bytesToAtom(key)))
    ]
  );
}

/*
def get_cat_burner_puzzle(
    bridging_puzzle_hash: bytes32,
    destination_chain: bytes,
    destination: bytes, # address of contract that receives message
) -> Program:
  return CAT_BURNER_MOD.curry(
    CAT_MOD_HASH,
    BURN_INNER_PUZZLE_MOD_HASH,
    bridging_puzzle_hash,
    destination_chain,
    destination
  )
*/
export function getCATBurnerPuzzle(
  destination_chain: string,
  destination: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(CAT_BURNER_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(CAT_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(BURN_INNER_PUZZLE_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(BRIDGING_PUZZLE_HASH),
      GreenWeb.util.sexp.bytesToAtom(destination_chain),
      GreenWeb.util.sexp.bytesToAtom(destination)
    ]
  );
}

/*
def get_cat_minter_puzzle(
    portal_receiver_launcher_id: bytes32,
    bridging_puzzle_hash: bytes32,
    source_chain: bytes,
    source: bytes
) -> Program:
  return CAT_MINTER_MOD.curry(
    get_message_coin_puzzle_1st_curry(portal_receiver_launcher_id).get_tree_hash(),
    CAT_MOD_HASH,
    WRAPPED_TAIL_MOD_HASH,
    CAT_MINT_AND_PAYOUT_MOD_HASH,
    raw_hash([
      b'\x01',
      get_cat_burner_puzzle(bridging_puzzle_hash, source_chain, source).get_tree_hash()
    ]), # CAT_BURNER_PUZZLE_HASH_HASH = (sha256 1 CAT_BURNER_PUZZLE_HASH_HASH)
    BURN_INNER_PUZZLE_MOD_HASH,
    source_chain,
    source
  )
*/
function getCATMinterPuzzle(
  portal_receiver_launcher_id: string,
  source_chain: string,
  source: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(CAT_MINTER_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getMessageCoinPuzzle1stCurry(portal_receiver_launcher_id)
        )
      ),
      GreenWeb.util.sexp.bytesToAtom(CAT_MOD_HASH), // the one in GreenWeb is CAT v1
      GreenWeb.util.sexp.bytesToAtom(WRAPPED_TAIL_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(CAT_MINT_AND_PAYOUT_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.stdHash("01" + GreenWeb.util.sexp.sha256tree(
          getCATBurnerPuzzle(source_chain, source)
        )) // sha256 1 CAT_BURNER_PUZZLE_HASH
      ),
      GreenWeb.util.sexp.bytesToAtom(BURN_INNER_PUZZLE_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(source_chain),
      GreenWeb.util.sexp.bytesToAtom(source),
    ]
  );
}

/*
def get_cat_mint_and_payout_inner_puzzle(
    receiver: bytes32
) -> Program:
  return CAT_MINT_AND_PAYOUT_MOD.curry(
    receiver
  )
*/
function getCATMintAndPayoutInnerPuzzle(
  receiver: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(CAT_MINT_AND_PAYOUT_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(receiver)
    ]
  );
}

/*
def get_cat_burn_inner_puzzle_first_curry(
    destination_chain: bytes,
    destination: bytes,
    source_chain_token_contract_address: bytes,
) -> Program:
  return BURN_INNER_PUZZLE_MOD.curry(
    get_cat_burner_puzzle(destination_chain, destination).get_tree_hash(),
    source_chain_token_contract_address
  )
*/
function getCATBurnInnerPuzzleFirstCurry(
  destination_chain: string,
  destination: string,
  source_chain_token_contract_address: string,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(BURN_INNER_PUZZLE_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getCATBurnerPuzzle(destination_chain, destination)
        )
      ),
      GreenWeb.util.sexp.bytesToAtom(source_chain_token_contract_address)
    ]
  );
}

/*
def get_cat_burn_inner_puzzle(
    destination_chain: bytes,
    destination: bytes, # e.g., ETH token bridge
    source_chain_token_contract_address: bytes,
    target_receiver: bytes,
    bridge_toll: int
) -> Program:
  return get_cat_burn_inner_puzzle_first_curry(
    destination_chain,
    destination,
    source_chain_token_contract_address
  ).curry(
    target_receiver,
    bridge_toll
  )
*/
function getCATBurnInnerPuzzle(
  destination_chain: string,
  destination: string,
  source_chain_token_contract_address: string,
  target_receiver: string,
  bridge_toll: number,
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    getCATBurnInnerPuzzleFirstCurry(
      destination_chain,
      destination,
      source_chain_token_contract_address
    ),
    [
      GreenWeb.util.sexp.bytesToAtom(target_receiver),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.amountToBytes(bridge_toll)
      )
    ]
  );
}

/*
def get_wrapped_tail(
    portal_receiver_launcher_id: bytes32,
    source_chain: bytes,
    source: bytes,
    source_chain_token_contract_address: bytes,
) -> Program:
  if len(source_chain_token_contract_address) < 32:
    source_chain_token_contract_address = b'\x00' * (32 - len(source_chain_token_contract_address)) + source_chain_token_contract_address
    
  return WRAPPED_TAIL_MOD.curry(
    get_cat_minter_puzzle(
      portal_receiver_launcher_id, source_chain, source
    ).get_tree_hash(),
    get_cat_burn_inner_puzzle_first_curry(
      source_chain, source, source_chain_token_contract_address
    ).get_tree_hash(),
  )
*/
function getWrappedTAIL(
  portal_receiver_launcher_id: string,
  source_chain: string,
  source: string,
  source_chain_token_contract_address: string,
): GreenWeb.clvm.SExp {
  if(source_chain_token_contract_address.length < 64) {
    source_chain_token_contract_address = "0".repeat(64 - source_chain_token_contract_address.length) + source_chain_token_contract_address;
  }
  
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(WRAPPED_TAIL_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getCATMinterPuzzle(portal_receiver_launcher_id, source_chain, source)
        )
      ),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getCATBurnInnerPuzzleFirstCurry(
            source_chain, source, source_chain_token_contract_address
          )
        )
      ),
    ]
  );
}

/*
def get_burn_inner_puzzle_solution(
    cat_burner_parent_id: bytes32,
    my_coin_id: bytes32,
    tail_reveal: Program
) -> Program:
  return Program.to([
    cat_burner_parent_id,
    my_coin_id,
    tail_reveal
  ])
*/
function getBurnInnerPuzzleSolution(
  cat_burner_parent_id: string,
  my_coin_id: string,
  tail_reveal: GreenWeb.clvm.SExp,
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(cat_burner_parent_id),
    GreenWeb.util.sexp.bytesToAtom(my_coin_id),
    tail_reveal
  ]);
}

/*
def get_cat_mint_and_payout_inner_puzzle_solution(
    tail_puzzle: Program,
    my_amount: int,
    parent_parent_info: bytes32,
) -> Program:
  return Program.to([
    tail_puzzle,
    my_amount,
    parent_parent_info
  ])
*/
function getCATMintAndPayoutInnerPuzzleSolution(
  tail_puzzle: GreenWeb.clvm.SExp,
  my_amount: number,
  parent_parent_info: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    tail_puzzle,
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(my_amount)
    ),
    GreenWeb.util.sexp.bytesToAtom(parent_parent_info)
  ]);
}

function getMessageAsSExp(message_contents: any): GreenWeb.clvm.SExp {
  return SExp.to(message_contents.map((content: string) => GreenWeb.util.sexp.bytesToAtom(
    GreenWeb.util.unhexlify(content)!
  )));
}

/*
def get_cat_minter_puzzle_solution(
    nonce: int,
    message: Program,
    my_puzzle_hash: bytes32,
    my_coin_id: bytes32,
    message_coin_parent_info: bytes32,
) -> Program:
  return Program.to([
    nonce,
    message,
    my_puzzle_hash,
    my_coin_id,
    message_coin_parent_info
  ])
*/
function getCATMinterPuzzleSolution(
  nonce: string,
  message_contents: any,
  my_puzzle_hash: string,
  my_coin_id: string,
  message_coin_parent_info: string,
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(nonce),
    getMessageAsSExp(message_contents),
    GreenWeb.util.sexp.bytesToAtom(my_puzzle_hash),
    GreenWeb.util.sexp.bytesToAtom(my_coin_id),
    GreenWeb.util.sexp.bytesToAtom(message_coin_parent_info)
  ]);
}

/*
def get_cat_burner_puzzle_solution(
    cat_parent_info: bytes32,
    tail_hash: bytes32,
    cat_amount: int,
    source_chain_token_contract_address: bytes,
    destination_receiver_address: bytes,
    my_coin: Coin
) -> Program:
  return Program.to([
    cat_parent_info,
    raw_hash([b'\x01', tail_hash]),
    cat_amount,
    source_chain_token_contract_address,
    destination_receiver_address,
    my_coin.amount,
    my_coin.puzzle_hash,
    my_coin.name()
  ])
*/
function getCATBurnerPuzzleSolution(
  cat_parent_info: string,
  tail_hash: string,
  cat_amount: BigNumberish,
  source_chain_token_contract_address: string,
  destination_receiver_address: string,
  my_coin: any,
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(cat_parent_info),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.sexp.sha256tree(
        SExp.to(GreenWeb.util.sexp.bytesToAtom(tail_hash))
      )
    ),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(cat_amount)
    ),
    GreenWeb.util.sexp.bytesToAtom(source_chain_token_contract_address),
    GreenWeb.util.sexp.bytesToAtom(destination_receiver_address),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(my_coin.amount)
    ),
    GreenWeb.util.sexp.bytesToAtom(my_coin.puzzleHash),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.getName(my_coin)
    )
  ]);
}

function getCATPuzzle(
  TAILProgramHash: string,
  innerPuzzle: SExp
): SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(CAT_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(CAT_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(TAILProgramHash),
      innerPuzzle
    ]
  )
}

function getCATSolution(
  innerPuzzleSolution: SExp,
  lineageProof: SExp | null,
  prevCoinId: string,
  thisCoinInfo: any,
  nextCoinProof: any,
  prevSubtotal: BigNumberish,
  extraDelta: BigNumberish
): SExp {
  return SExp.to([
    innerPuzzleSolution,
    lineageProof ?? SExp.FALSE,
    GreenWeb.util.sexp.bytesToAtom(prevCoinId),
    GreenWeb.util.coin.toProgram(thisCoinInfo),
    GreenWeb.util.coin.toProgram(nextCoinProof),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(prevSubtotal)
    ),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(extraDelta)
    ),
  ])
}

export function getWrappedERC20AssetID(sourceChain: Network, erc20ContractAddress: string) {
  erc20ContractAddress = GreenWeb.util.unhexlify(erc20ContractAddress)!;
  erc20ContractAddress = "0".repeat(64 - erc20ContractAddress.length) + erc20ContractAddress;

  return GreenWeb.util.sexp.sha256tree(
    getWrappedTAIL(
      CHIA_NETWORK.portalLauncherId!,
      stringToHex(sourceChain.id),
      GreenWeb.util.unhexlify(sourceChain.erc20BridgeAddress!)!,
      erc20ContractAddress
    )
  );
}

export function mintCATs(
  message: any,
  portalCoinRecord: any,
  portalParentSpend: any,
  nonces: any,
  chains_and_nonces_used_last_spend: [string, string][],
  offer: string,
  sig_strings: string[],
  sig_switches: boolean[],
  source_chain: string,
  source_contract: string,
  portal_receiver_launcher_id: string,
) {
  const {
    nonce,
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
    var createCoinConds = conditionsDict!.get("33" as ConditionOpcode) ?? [];

    for(var j = 0; j < createCoinConds.length; ++j) {
      const cond = createCoinConds[j];

      if(cond.vars[0] === OFFER_MOD_HASH) {
        source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
        source_coin.puzzleHash = OFFER_MOD_HASH;
        source_coin.amount = tokenAmountInt;
        break;
      }
    }
  }

  /* beign building spend bundle */
  var coin_spends = offer_sb.coinSpends;
  const sigs: string[] = [];
  sigs.push(offer_sb.aggregatedSignature);
  
  /* spend portal to create message */
  const portalCoin = portalCoinRecord.coin;

  const updatePuzzle = getMOfNDelegateDirectPuzzle(
    CHIA_NETWORK.multisigThreshold!,
    CHIA_NETWORK.multisigInfos!,
  );
  const portalInnerPuzzle = getPortalReceiverInnerPuzzle(
    portal_receiver_launcher_id,
    CHIA_NETWORK.signatureThreshold!,
    CHIA_NETWORK.validatorInfos!,
    GreenWeb.util.sexp.sha256tree(updatePuzzle),
    chains_and_nonces_used_last_spend
  );
  const portalPuzzle = GreenWeb.util.sexp.singletonPuzzle(portal_receiver_launcher_id, portalInnerPuzzle);

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

  const portalInnerSolution = getPortalReceiverInnerSolution(
    sig_switches,
    nonce,
    source_chain,
    GreenWeb.util.unhexlify(source_contract)!,
    destination,
    contents
  );
  const portalSolution = GreenWeb.util.sexp.singletonSolution(
    portalLineageProof,
    1,
    portalInnerSolution
  );

  const portalCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  portalCoinSpend.coin = GreenWeb.util.goby.parseGobyCoin({
    amount: 1,
    parent_coin_info: GreenWeb.util.unhexlify(portalCoin.parent_coin_info),
    puzzle_hash: GreenWeb.util.unhexlify(portalCoin.puzzle_hash)
  })!;
  portalCoinSpend.puzzleReveal = portalPuzzle;
  portalCoinSpend.solution = portalSolution;
  coin_spends.push(portalCoinSpend);

  /* spend source coin to create minter */
  const minterPuzzle = getCATMinterPuzzle(
    portal_receiver_launcher_id,
    source_chain,
    GreenWeb.util.unhexlify(source_contract)!
  );
  const minterPuzzleHash = GreenWeb.util.sexp.sha256tree(minterPuzzle);
  const sourceCoinSolution = SExp.to([
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.unhexlify(nonce)!
      ),
      [
        GreenWeb.util.sexp.bytesToAtom(minterPuzzleHash),
        tokenAmountInt
      ]
    ],
  ]);

  const sourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  sourceCoinSpend.coin = source_coin;
  sourceCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(OFFER_MOD);
  sourceCoinSpend.solution = sourceCoinSolution;
  coin_spends.push(sourceCoinSpend);

  /* spend minter coin */
  const minterCoin = new GreenWeb.Coin();
  minterCoin.parentCoinInfo = GreenWeb.util.coin.getName(source_coin);
  minterCoin.puzzleHash = minterPuzzleHash;
  minterCoin.amount = tokenAmountInt;

  const minterSolution = getCATMinterPuzzleSolution(
    GreenWeb.util.unhexlify(nonce)!,
    contents,
    minterCoin.puzzleHash,
    GreenWeb.util.coin.getName(minterCoin),
    GreenWeb.util.coin.getName(portalCoinSpend.coin)
  );

  const minterCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  minterCoinSpend.coin = minterCoin;
  minterCoinSpend.puzzleReveal = minterPuzzle;
  minterCoinSpend.solution = minterSolution;
  coin_spends.push(minterCoinSpend);
  
  /* spend message coin */
  const messageCoinPuzzle = getMessageCoinPuzzle(
    portal_receiver_launcher_id,
    source_chain,
    GreenWeb.util.unhexlify(source_contract)!,
    GreenWeb.util.unhexlify(nonce)!,
    destination,
    GreenWeb.util.sexp.sha256tree(
      getMessageAsSExp(contents)
    )
  );
  console.log({ messageSExp: GreenWeb.util.sexp.toHex(getMessageAsSExp(contents)) })

  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = GreenWeb.util.coin.getName(portalCoinSpend.coin);
  messageCoin.puzzleHash = GreenWeb.util.sexp.sha256tree(messageCoinPuzzle);
  messageCoin.amount = 0;

  const messageCoinSolution = getMessageCoinSolution(
    minterCoin,
    portalCoin.parent_coin_info,
    GreenWeb.util.sexp.sha256tree(portalInnerPuzzle),
    GreenWeb.util.coin.getName(messageCoin)
  );

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = messageCoinPuzzle;
  messageCoinSpend.solution = messageCoinSolution;
  coin_spends.push(messageCoinSpend);

  /* spend eve CAT coin */
  const wrappedAssetTAIL = getWrappedTAIL(
    portal_receiver_launcher_id,
    source_chain,
    GreenWeb.util.unhexlify(source_contract)!,
    GreenWeb.util.unhexlify(ethAssetContract)!
  );
  const wrappedAssetTAILHash = GreenWeb.util.sexp.sha256tree(wrappedAssetTAIL);

  const mintAndPayoutInnerPuzzle = getCATMintAndPayoutInnerPuzzle(
    xchReceiverPh
  );

  const eveCATPuzzle = getCATPuzzle(
    wrappedAssetTAILHash,
    mintAndPayoutInnerPuzzle
  )
  const eveCATPuzzleHash = GreenWeb.util.sexp.sha256tree(eveCATPuzzle);

  const eveCAT = new GreenWeb.Coin();
  eveCAT.parentCoinInfo = GreenWeb.util.coin.getName(minterCoin);
  console.log({ minterCoin })
  eveCAT.puzzleHash = eveCATPuzzleHash;
  eveCAT.amount = tokenAmountInt;

  const eveCATInnerSolution = getCATMintAndPayoutInnerPuzzleSolution(
    wrappedAssetTAIL,
    tokenAmountInt,
    minterCoin.parentCoinInfo
  );
  const eveCATProof = {
    parentCoinInfo: eveCAT.parentCoinInfo,
    puzzleHash: GreenWeb.util.sexp.sha256tree(mintAndPayoutInnerPuzzle), // inner puzzle hash since this is a CAT proof
    amount: eveCAT.amount
  }
  const eveCATSolution = getCATSolution(
    eveCATInnerSolution,
    null,
    GreenWeb.util.coin.getName(eveCAT),
    eveCAT,
    eveCATProof,
    0,
    0
  );

  const eveCATSpend = new GreenWeb.util.serializer.types.CoinSpend();
  eveCATSpend.coin = eveCAT;
  eveCATSpend.puzzleReveal = eveCATPuzzle;
  eveCATSpend.solution = eveCATSolution;
  coin_spends.push(eveCATSpend);

  /* lastly, aggregate sigs  and build spend bundle */

  sig_strings.map((sig_string) => {
    var [
      origin_chain,
      destination_chain,
      nonce,
      coin_id,
      sig
    ] = decodeSignature(sig_string);
    console.log({origin_chain,
      nonce,
      coin_id,
      sig
    });
    sigs.push(sig);
  });

  const { AugSchemeMPL, G2Element } = getBLSModule();

  console.log({ sigs })

  const sb = new GreenWeb.util.serializer.types.SpendBundle();
  sb.coinSpends = coin_spends;
  sb.aggregatedSignature = Buffer.from(
    AugSchemeMPL.aggregate(
      sigs.map((sig) => G2Element.from_bytes(Buffer.from(sig, "hex")))
    ).serialize()
  ).toString("hex");
  // console.log( sbToString(sb) );

  return {
    sb,
    txId: GreenWeb.util.coin.getName(messageCoin)
  };
}

export function getBurnSendAddress(
  destination_chain: string,
  destination: string,
  source_chain_token_contract_address: string,
  target_receiver: string,
  prefix: string = "xch",
  bridging_toll_mojos: number
) {
  source_chain_token_contract_address = GreenWeb.util.unhexlify(source_chain_token_contract_address)!;
  source_chain_token_contract_address = "0".repeat(64 - source_chain_token_contract_address.length) + source_chain_token_contract_address;

  const burnInnerPuzzle = getCATBurnInnerPuzzle(
    destination_chain,
    destination,
    source_chain_token_contract_address,
    target_receiver,
    bridging_toll_mojos
  );

  const burnInnerPuzzleHash = GreenWeb.util.sexp.sha256tree(burnInnerPuzzle);

  return GreenWeb.util.address.puzzleHashToAddress(
    burnInnerPuzzleHash,
    prefix
  );
}

export function getBurnSendFullPuzzleHash(
  destination_chain: string,
  destination: string,
  source_chain_token_contract_address: string,
  target_receiver: string,
  portal_receiver_launcher_id: string,
  bridging_toll_mojos: number,
): string {
  source_chain_token_contract_address = GreenWeb.util.unhexlify(source_chain_token_contract_address)!;
  source_chain_token_contract_address = "0".repeat(64 - source_chain_token_contract_address.length) + source_chain_token_contract_address;

  const burnInnerPuzzle = getCATBurnInnerPuzzle(
    destination_chain,
    destination,
    source_chain_token_contract_address,
    target_receiver,
    bridging_toll_mojos
  );

  const wrappedTAIL = getWrappedTAIL(
    portal_receiver_launcher_id,
    destination_chain,
    destination,
    source_chain_token_contract_address
  );
  const wrappedTAILHash = GreenWeb.util.sexp.sha256tree(wrappedTAIL);

  console.log({ wrappedTAILHash, destination });

  const fullPuzzle = getCATPuzzle(
    wrappedTAILHash,
    burnInnerPuzzle
  );

  return GreenWeb.util.sexp.sha256tree(fullPuzzle);
}

export async function burnCATs(
  offer: string,
  destination_chain: string,
  token_contract_address: string,
  eth_target_address: string,
  bridge_contract_address: string,
  portal_receiver_launcher_id: string,
  bridging_toll_mojos: number,
  agg_sig_additional_data: string,
): Promise<[any, string]> {
  token_contract_address = GreenWeb.util.unhexlify(token_contract_address)!;
  token_contract_address = "0".repeat(64 - token_contract_address.length) + token_contract_address;

  const offer_sb = offerToSpendBundle(offer);

  /* find source coin = coin with OFFER_MOD that will create CAT minter */
  var xch_source_coin = new GreenWeb.Coin();
  var cat_source_coin = new GreenWeb.Coin();
  var cat_source_coin_lineage_proof = new GreenWeb.Coin();
  var cat_source_coin_puzzle;
  var cat_source_coin_puzzle_hash;

  for(var i = 0; i < offer_sb.coinSpends.length; ++i) {
    const coinSpend = offer_sb.coinSpends[i];

    var conditions = GreenWeb.util.sexp.asAtomList(
        GreenWeb.util.sexp.run(
          coinSpend.puzzleReveal,
          coinSpend.solution,
        )
    );

    for(var j = 0; j < conditions.length; ++j) {
      const cond = GreenWeb.util.sexp.asAtomList(
        GreenWeb.util.sexp.fromHex(conditions[j])
      );

      if(cond[0] == "33") { // CREATE_COIN
        if(
          cond[1] == OFFER_MOD_HASH
        ) { // xch source coin parent
            xch_source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
            xch_source_coin.puzzleHash = OFFER_MOD_HASH;
            xch_source_coin.amount = parseInt(cond[2], 16);
        } else { // check if CAT source parent
            const uncurryRes = GreenWeb.util.sexp.uncurry(
              coinSpend.puzzleReveal
            )
            if(uncurryRes === null) { continue; }
            
            const [uncurried_mod, args] = uncurryRes;
            if(GreenWeb.util.sexp.toHex(uncurried_mod) != CAT_MOD || args.length < 3) { continue; }

            const tailHash = args[1].as_bin().hex().slice(2); // remove a0 (len) from bytes representation

            cat_source_coin_puzzle = getCATPuzzle(
              tailHash,
              GreenWeb.util.sexp.fromHex(OFFER_MOD)
            );
            cat_source_coin_puzzle_hash = GreenWeb.util.sexp.sha256tree(cat_source_coin_puzzle);

            if(cat_source_coin_puzzle_hash != cond[1]) { continue; }

            console.log({ wrappedTokenTailHash: tailHash });

            cat_source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
            cat_source_coin.puzzleHash = cat_source_coin_puzzle_hash;
            cat_source_coin.amount = parseInt(cond[2], 16);

            cat_source_coin_lineage_proof.parentCoinInfo = coinSpend.coin.parentCoinInfo;
            cat_source_coin_lineage_proof.puzzleHash = GreenWeb.util.sexp.sha256tree(args[2]); // inner puzzle hash
            cat_source_coin_lineage_proof.amount = coinSpend.coin.amount;
        }
      }
    }
  }

  /* beign building spend bundle */
  var coin_spends = offer_sb.coinSpends;
  const sigs: string[] = [
    offer_sb.aggregatedSignature
  ];

  /* security coin adds a sig to this bundle so bundle_agg_sig != offer_agg_sig */
  /* it comes between the offer coin and the CAT burner coin */

  // https://gist.github.com/Yakuhito/d0e5bc4218138fcb183dfef4aaf3edd2
  const tempSeed = require('crypto').randomBytes(32).toString('hex');
  const mnemonic = GreenWeb.util.key.mnemonic.bytesToMnemonic(tempSeed);

  const tempSk = GreenWeb.util.key.mnemonic.privateKeyFromMnemonic(mnemonic);
  const tempPk = tempSk.get_g1();

  const securityCoinPuzzle = GreenWeb.util.sexp.standardCoinPuzzle(tempPk, true);
  const securityCoinPuzzleHash = GreenWeb.util.sexp.sha256tree(securityCoinPuzzle);

  const securityCoin = new GreenWeb.Coin();
  securityCoin.parentCoinInfo = GreenWeb.util.coin.getName(xch_source_coin);
  securityCoin.puzzleHash = securityCoinPuzzleHash;
  securityCoin.amount = bridging_toll_mojos;

  /* spend xch source coin = offer coin */

  const xchSourceCoinSolution = SExp.to([
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.getName(xch_source_coin)
      ),
      [
        GreenWeb.util.sexp.bytesToAtom(securityCoinPuzzleHash),
        bridging_toll_mojos
      ]
    ],
  ])

  const xchSourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  xchSourceCoinSpend.coin = xch_source_coin;
  xchSourceCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(OFFER_MOD);
  xchSourceCoinSpend.solution = xchSourceCoinSolution;
  
  coin_spends.push(xchSourceCoinSpend);

  /* spend CAT source coin */
  const burnInnerPuzzle = getCATBurnInnerPuzzle(
    destination_chain,
    bridge_contract_address.slice(2),
    token_contract_address,
    eth_target_address.slice(2),
    bridging_toll_mojos
  );
  const burnInnerPuzzleHash = GreenWeb.util.sexp.sha256tree(burnInnerPuzzle);

  const catSourceCoinInnerSolution = SExp.to([
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.getName(cat_source_coin)
      ),
      [
        GreenWeb.util.sexp.bytesToAtom(burnInnerPuzzleHash),
        cat_source_coin.amount
      ]
    ],
  ]);

  const cat_source_coin_proof = new GreenWeb.Coin();
  cat_source_coin_proof.parentCoinInfo = cat_source_coin.parentCoinInfo;
  cat_source_coin_proof.puzzleHash = OFFER_MOD_HASH; // inner puzzle hash
  cat_source_coin_proof.amount = cat_source_coin.amount;

  const catSourceCoinSolution = getCATSolution(
    catSourceCoinInnerSolution,
    GreenWeb.util.coin.toProgram(cat_source_coin_lineage_proof),
    GreenWeb.util.coin.getName(cat_source_coin),
    cat_source_coin,
    cat_source_coin_proof,
    BigInt(cat_source_coin.amount.toString()),
    0
  );

  const catSourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  catSourceCoinSpend.coin = cat_source_coin;
  catSourceCoinSpend.puzzleReveal = cat_source_coin_puzzle as GreenWeb.clvm.SExp;
  catSourceCoinSpend.solution = catSourceCoinSolution;

  coin_spends.push(catSourceCoinSpend);

  /* spend CAT burner */
  const catBurnerPuzzle = getCATBurnerPuzzle(
    destination_chain,
    bridge_contract_address.slice(2)
  );
  const catBurnerCoin = new GreenWeb.Coin();
  catBurnerCoin.parentCoinInfo = GreenWeb.util.coin.getName(securityCoin);
  catBurnerCoin.puzzleHash = GreenWeb.util.sexp.sha256tree(catBurnerPuzzle);
  catBurnerCoin.amount = bridging_toll_mojos;

  const wrappedTAIL = getWrappedTAIL(
    portal_receiver_launcher_id,
    destination_chain,
    bridge_contract_address.slice(2),
    token_contract_address
  );
  const wrappedTAILHash = GreenWeb.util.sexp.sha256tree(wrappedTAIL);
  console.log({ wrappedTAILHash, token_contract_address });

  const burnCoinFullPuzzle = getCATPuzzle(
    wrappedTAILHash,
    burnInnerPuzzle
  );

  const userCatCoin = new GreenWeb.Coin();
  userCatCoin.parentCoinInfo = GreenWeb.util.coin.getName(cat_source_coin);
  userCatCoin.puzzleHash = GreenWeb.util.sexp.sha256tree(burnCoinFullPuzzle);
  userCatCoin.amount = cat_source_coin.amount;

  const catBurnerSolution = getCATBurnerPuzzleSolution(
    userCatCoin.parentCoinInfo,
    wrappedTAILHash,
    BigInt(userCatCoin.amount.toString()),
    token_contract_address,
    eth_target_address,
    catBurnerCoin
  );

  const catBurnerSpend = new GreenWeb.util.serializer.types.CoinSpend();
  catBurnerSpend.coin = catBurnerCoin;
  catBurnerSpend.puzzleReveal = catBurnerPuzzle;
  catBurnerSpend.solution = catBurnerSolution;

  coin_spends.push(catBurnerSpend);
  
  /* spend security coin */
  const securityCoinInnerConds = [
    GreenWeb.spend.createCoinCondition(catBurnerCoin.puzzleHash, catBurnerCoin.amount),
    SExp.to([
        GreenWeb.util.sexp.bytesToAtom("40"), // ASSERT_CONCURRENT_SPEND
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.getName(catBurnerCoin)
        ),
    ])
  ];
  const securityCoinSolution = GreenWeb.util.sexp.standardCoinSolution(
    securityCoinInnerConds
  );

  const securityCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  securityCoinSpend.coin = securityCoin;
  securityCoinSpend.puzzleReveal = securityCoinPuzzle;
  securityCoinSpend.solution = securityCoinSolution;
  
  coin_spends.push(securityCoinSpend);

  /* spend CAT coin */
  const burnInnerSolution = getBurnInnerPuzzleSolution(
    catBurnerCoin.parentCoinInfo,
    GreenWeb.util.coin.getName(userCatCoin),
    wrappedTAIL
  );

  console.log({ userCatCoin })
  const burnCoinSolution = getCATSolution(
    burnInnerSolution,
    GreenWeb.util.coin.toProgram(cat_source_coin_proof),
    GreenWeb.util.coin.getName(userCatCoin),
    userCatCoin,
    {
      parentCoinInfo: userCatCoin.parentCoinInfo,
      puzzleHash: GreenWeb.util.sexp.sha256tree(burnInnerPuzzle),
      amount: userCatCoin.amount
    }, // next coin proof
    0,
    -cat_source_coin.amount
  )

  const burnCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  burnCoinSpend.coin = userCatCoin;
  burnCoinSpend.puzzleReveal = burnCoinFullPuzzle;
  burnCoinSpend.solution = burnCoinSolution;

  coin_spends.push(burnCoinSpend);

  /* spend message coin */
  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = GreenWeb.util.coin.getName(catBurnerCoin);
  messageCoin.puzzleHash = BRIDGING_PUZZLE_HASH;
  messageCoin.amount = bridging_toll_mojos;
  
  const messageCoinSolution = SExp.to([
    messageCoin.amount
  ]);

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(BRIDGING_PUZZLE);
  messageCoinSpend.solution = messageCoinSolution;

  coin_spends.push(messageCoinSpend);

  /* lastly, aggregate sigs and build spend bundle */

  const { AugSchemeMPL, G2Element } = getBLSModule();

  // (list AGG_SIG_ME SYNTHETIC_PUBLIC_KEY (sha256tree1 delegated_puzzle))
  const securityDelegatedPuzzle = GreenWeb.util.sexp.run(
      GreenWeb.util.sexp.P2_CONDITIONS_PROGRAM,
      SExp.to([
          SExp.to(securityCoinInnerConds),
      ])
  );
  const securityDelegatedPuzzleHash = GreenWeb.util.sexp.sha256tree(securityDelegatedPuzzle);
  const dataToSign = securityDelegatedPuzzleHash + GreenWeb.util.coin.getName(securityCoin) + agg_sig_additional_data;
  const securityCoinSigRaw = AugSchemeMPL.sign(tempSk, Buffer.from(dataToSign, "hex"));
  const securityCoinSig = Buffer.from(
    securityCoinSigRaw.serialize()
  ).toString("hex");
  sigs.push(securityCoinSig);

  const sb = new GreenWeb.util.serializer.types.SpendBundle();
  sb.coinSpends = coin_spends;
  sb.aggregatedSignature = Buffer.from(
    AugSchemeMPL.aggregate(
      sigs.map((sig) => G2Element.from_bytes(Buffer.from(sig, "hex")))
    ).serialize()
  ).toString("hex");

  const nonce = GreenWeb.util.coin.getName(messageCoin);
  return [sb, nonce];
}


const LOCKER_MOD = "ff02ffff01ff04ffff04ff10ffff04ff8202ffff808080ffff04ffff04ff18ffff04ff8205ffff808080ffff04ffff04ff12ffff04ff8217ffff808080ffff04ffff04ff14ffff04ffff0bffff02ffff03ffff09ff82017fff8080ffff012fffff01ff0bff56ffff0bff1affff0bff1aff66ff1780ffff0bff1affff0bff76ffff0bff1affff0bff1aff66ffff0bffff0101ff178080ffff0bff1affff0bff76ffff0bff1affff0bff1aff66ffff0bffff0101ff82017f8080ffff0bff1affff0bff76ffff0bff1affff0bff1aff66ff2f80ffff0bff1aff66ff46808080ff46808080ff46808080ff4680808080ff0180ffff02ff1effff04ff02ffff04ffff04ff8205ffffff04ffff04ff81bfffff04ff820bffff808080ff808080ff8080808080ff808080ffff04ffff04ff1cffff04ff5fffff04ff8202ffffff04ffff04ff05ffff04ff0bffff04ff8217ffffff04ff820bffff8080808080ff8080808080ff808080808080ffff04ffff01ffffff4946ff3f33ffff3c02ffffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";
const UNLOCKER_MOD = "ff02ffff01ff02ff3cffff04ff02ffff04ffff0bffff02ffff03ffff09ffff0dff82017f80ffff012080ffff0182017fffff01ff088080ff0180ffff02ff36ffff04ff02ffff04ff17ffff04ffff0bffff0102ffff0bffff0101ff2f80ff8202ff80ffff04ff5fffff04ffff0bffff0101ff8217ff80ffff04ffff0bffff0101ffff02ff3effff04ff02ffff04ffff04ff8205ffffff04ff820bffff808080ff8080808080ff8080808080808080ff8080ffff04ff822fffffff04ffff02ff12ffff04ff02ffff04ffff02ffff03ffff09ffff12ff81bfffff010180ff8080ffff01ff02ff36ffff04ff02ffff04ff0bffff04ffff0bffff0101ff8217ff80ff8080808080ffff01ff02ff36ffff04ff02ffff04ff05ffff04ffff0bffff0101ff0580ffff04ffff0bffff0101ff81bf80ffff04ffff02ff36ffff04ff02ffff04ff0bffff04ffff0bffff0101ff8217ff80ff8080808080ff8080808080808080ff0180ffff04ffff02ff36ffff04ff02ffff04ff0bffff04ffff0bffff0101ff8217ff80ff8080808080ffff04ff822fffffff04ffff12ffff0101ff820bff80ffff04ff8205ffffff04ffff12ffff0101ff820bff80ffff04ff825fffffff04ffff04ffff04ff28ffff04ff822fffff808080ffff04ffff04ff38ffff04ff8217ffff808080ff808080ff8080808080808080808080ff808080808080ffff04ffff01ffffff3dff4648ffff333cff02ff04ffff04ff10ffff04ffff0bff05ff0b80ff808080ffff04ffff04ff34ffff04ff05ff808080ff178080ffffff02ff2affff04ff02ffff04ffff0bffff02ffff03ffff09ffff0dff82047f80ffff012080ffff0182047fffff01ff088080ff0180ff05ffff02ffff03ffff15ff82067fff8080ffff0182067fffff01ff088080ff018080ffff04ff17ffff04ffff02ffff03ff82037fffff01ff01a04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459affff01ff02ff3effff04ff02ffff04ffff04ffff0101ffff04ffff04ff24ffff04ff5fffff04ff2fffff04ffff04ff5fff8080ff8080808080ffff02ffff03ffff09ff82067fff81bf80ff80ffff01ff04ffff04ff24ffff04ff0bffff04ffff11ff82067fff81bf80ff80808080ff808080ff01808080ff8080808080ff0180ffff04ffff02ffff03ff82037fffff01ff02ff12ffff04ff02ffff04ff05ffff04ff0bffff04ff17ffff04ff2fffff04ff5fffff04ffff11ff81bfff82067f80ffff04ff82037fffff04ff8202ffff8080808080808080808080ffff018202ff80ff0180ff80808080808080ffff04ffff04ff10ffff04ffff0bff05ffff0bff0bff178080ff808080ffff04ffff04ff34ffff04ffff0bff05ff1780ff808080ff2f8080ff02ffff03ff05ffff01ff0bff81e6ffff02ff2effff04ff02ffff04ff09ffff04ffff02ff3affff04ff02ffff04ff0dff80808080ff808080808080ffff0181c680ff0180ffffffffa04bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459aa09dcf97a184f32623d11a73124ceb99a5709b083721e878a16d78f596718ba7b2ffa102a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222a102a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5ff0bff81a6ffff02ff2effff04ff02ffff04ff05ffff04ffff02ff3affff04ff02ffff04ff07ff80808080ff808080808080ffff0bff2cffff0bff2cff81c6ff0580ffff0bff2cff0bff81868080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff3effff04ff02ffff04ff09ff80808080ffff02ff3effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";
const P2_CONTROLLER_PUZZLE_HASH_MOD = "ff02ffff01ff02ff16ffff04ff02ffff04ffff0bffff02ffff03ffff09ffff0dff1780ffff012080ffff0117ffff01ff088080ff0180ff05ff2f80ffff04ff0bffff04ffff02ff1effff04ff02ffff04ff5fff80808080ffff04ffff02ff5fff81bf80ff80808080808080ffff04ffff01ffff3d46ff3cffff04ffff04ff0cffff04ff0bff808080ffff04ffff04ff0affff04ffff0bff05ff1780ff808080ffff04ffff04ff08ffff04ffff0bff05ffff0bff0bff178080ff808080ff2f808080ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff1effff04ff02ffff04ff09ff80808080ffff02ff1effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";

/*
>>> from drivers.wrapped_cats import P2_CONTROLLER_PUZZLE_HASH_MOD_HASH
>>> P2_CONTROLLER_PUZZLE_HASH_MOD_HASH.hex()
'a8082b5622ccb27e89f196f024f9851dee0bcb0f2d8afd395caa6d4432f6f85f'
*/
const P2_CONTROLLER_PUZZLE_HASH_MOD_HASH = "a8082b5622ccb27e89f196f024f9851dee0bcb0f2d8afd395caa6d4432f6f85f";

/*
def get_p2_controller_puzzle_hash_inner_puzzle_hash(
    controller_puzzle_hash: bytes32
) -> Program:
  return P2_CONTROLLER_PUZZLE_HASH_MOD.curry(
    controller_puzzle_hash
  )
*/
export function getP2ControllerPuzzleHashInnerPuzzle(
  controller_puzzle_hash: string
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(P2_CONTROLLER_PUZZLE_HASH_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(controller_puzzle_hash)
    ]
  );
}

/*
def get_unlocker_puzzle(
    message_source_chain: bytes,
    message_source: bytes,
    portal_receiver_launcher_id: bytes32,
    asset_id: bytes32
) -> Program:
  return UNLOCKER_MOD.curry(
    CAT_MOD_HASH,
    P2_CONTROLLER_PUZZLE_HASH_MOD_HASH,
    get_message_coin_puzzle_1st_curry(portal_receiver_launcher_id).get_tree_hash(),
    message_source_chain,
    raw_hash([b"\x01", message_source]),
    asset_id
  )
*/
export function getUnlockerPuzzle(
  message_source_chain: string,
  message_source: string,
  portal_receiver_launcher_id: string,
  asset_id: string | null
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(UNLOCKER_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(CAT_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(P2_CONTROLLER_PUZZLE_HASH_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getMessageCoinPuzzle1stCurry(portal_receiver_launcher_id)
        )
      ),
      GreenWeb.util.sexp.bytesToAtom(message_source_chain),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.stdHash("01" + message_source) // sha256 1 message_source
      ),
      asset_id !== null ? GreenWeb.util.sexp.bytesToAtom(asset_id) : SExp.to([])
    ]
  );
}

/*
def get_locker_puzzle(
    message_destination_chain: bytes,
    message_destination: bytes,
    portal_receiver_launcher_id: bytes32,
    asset_id: bytes32
) -> Program:
  return LOCKER_MOD.curry(
    message_destination_chain,
    message_destination,
    CAT_MOD_HASH,
    OFFER_MOD_HASH,
    BRIDGING_PUZZLE_HASH,
    get_p2_controller_puzzle_hash_inner_puzzle_hash(
      get_unlocker_puzzle(
        message_destination_chain,
        message_destination,
        portal_receiver_launcher_id,
        asset_id
      ).get_tree_hash()
    ).get_tree_hash(),
    asset_id
  )
*/
export function getLockerPuzzle(
  message_destination_chain: string,
  message_destination: string,
  portal_receiver_launcher_id: string,
  asset_id: string | null
): GreenWeb.clvm.SExp {
  return GreenWeb.util.sexp.curry(
    GreenWeb.util.sexp.fromHex(LOCKER_MOD),
    [
      GreenWeb.util.sexp.bytesToAtom(message_destination_chain),
      GreenWeb.util.sexp.bytesToAtom(message_destination),
      GreenWeb.util.sexp.bytesToAtom(CAT_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(OFFER_MOD_HASH),
      GreenWeb.util.sexp.bytesToAtom(BRIDGING_PUZZLE_HASH),
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.sexp.sha256tree(
          getP2ControllerPuzzleHashInnerPuzzle(
            GreenWeb.util.sexp.sha256tree(
              getUnlockerPuzzle(
                message_destination_chain,
                message_destination,
                portal_receiver_launcher_id,
                asset_id
              )
            )
          )
        )
      ),
      asset_id !== null ? GreenWeb.util.sexp.bytesToAtom(asset_id) : SExp.to([])
    ]
  );
}

/*
def get_p2_controller_puzzle_hash_inner_solution(
    my_id: bytes32,
    controller_parent_info: bytes32,
    controller_amount: int,
    delegated_puzzle: Program,
    delegated_solution: Program
) -> Program:
  return Program.to([
    my_id,
    controller_parent_info,
    controller_amount,
    delegated_puzzle,
    delegated_solution
  ])
*/
export function getP2ControllerPuzzleHashInnerSolution(
  my_id: string,
  controller_parent_info: string,
  controller_amount: number,
  delegated_puzzle: GreenWeb.clvm.SExp,
  delegated_solution: GreenWeb.clvm.SExp
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(my_id),
    GreenWeb.util.sexp.bytesToAtom(controller_parent_info),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(controller_amount)
    ),
    delegated_puzzle,
    delegated_solution
  ]);
}

/*
def get_unlocker_solution(
    message_coin_parent_id: bytes32,
    message_nonce_hash: bytes32,
    receiver: bytes32,
    asset_amount_b32: bytes32,
    my_puzzle_hash: bytes32,
    my_id: bytes32,
    locked_coin_proofs: List[Tuple[bytes32, int]]
) -> Program:
  return Program.to([
    message_coin_parent_id,
    message_nonce_hash,
    receiver,
    asset_amount_b32,
    my_puzzle_hash,
    my_id,
    Program.to(locked_coin_proofs)
  ])
*/
export function getUnlockerSolution(
  message_coin_parent_id: string,
  message_nonce_hash: string,
  receiver: string,
  asset_amount_b32: string,
  my_puzzle_hash: string,
  my_id: string,
  locked_coin_proofs: [string, number][]
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(message_coin_parent_id),
    GreenWeb.util.sexp.bytesToAtom(message_nonce_hash),
    GreenWeb.util.sexp.bytesToAtom(receiver),
    GreenWeb.util.sexp.bytesToAtom(asset_amount_b32),
    GreenWeb.util.sexp.bytesToAtom(my_puzzle_hash),
    GreenWeb.util.sexp.bytesToAtom(my_id),
    SExp.to(
      locked_coin_proofs.map((proof) => SExp.to([
        GreenWeb.util.sexp.bytesToAtom(proof[0]),
        GreenWeb.util.sexp.bytesToAtom(
          GreenWeb.util.coin.amountToBytes(proof[1])
        )
      ]))
    ),
  ]);
}

/*
def get_locker_solution(
    my_amount: int,
    my_id: bytes32,
    asset_amount: int,
    receiver: bytes
) -> Program:
  return Program.to([
    my_amount,
    my_id,
    asset_amount,
    receiver
  ])
*/
export function getLockerSolution(
  my_amount: BigNumberish,
  my_id: string,
  asset_amount: BigNumberish,
  receiver: string
): GreenWeb.clvm.SExp {
  return SExp.to([
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(my_amount)
    ),
    GreenWeb.util.sexp.bytesToAtom(my_id),
    GreenWeb.util.sexp.bytesToAtom(
      GreenWeb.util.coin.amountToBytes(asset_amount)
    ),
    GreenWeb.util.sexp.bytesToAtom(receiver)
  ]);
}


export async function lockCATs(
  offer: string,
  destination_chain: string,
  wrapped_cat_address: string,
  target_recipient: string,
  portal_receiver_launcher_id: string,
  bridging_toll_mojos: number,
  agg_sig_additional_data: string,
): Promise<[any, string]> {
  target_recipient = GreenWeb.util.unhexlify(target_recipient)!;
  wrapped_cat_address = GreenWeb.util.unhexlify(wrapped_cat_address)!;

  const offer_sb = offerToSpendBundle(offer);

  /* find source coin = coin with OFFER_MOD that will create CAT minter */
  var xch_source_coin = new GreenWeb.Coin();
  var cat_source_coin = new GreenWeb.Coin();
  var cat_source_coin_lineage_proof = new GreenWeb.Coin();
  var cat_source_coin_puzzle;
  var cat_source_coin_puzzle_hash;

  var tailHashHex: string | null = null;

  for(var i = 0; i < offer_sb.coinSpends.length; ++i) {
    const coinSpend = offer_sb.coinSpends[i];

    var conditions = GreenWeb.util.sexp.asAtomList(
        GreenWeb.util.sexp.run(
          coinSpend.puzzleReveal,
          coinSpend.solution,
        )
    );

    for(var j = 0; j < conditions.length; ++j) {
      const cond = GreenWeb.util.sexp.asAtomList(
        GreenWeb.util.sexp.fromHex(conditions[j])
      );

      if(cond[0] == "33") { // CREATE_COIN
        if(
          cond[1] == OFFER_MOD_HASH
        ) { // xch source coin parent
            xch_source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
            xch_source_coin.puzzleHash = OFFER_MOD_HASH;
            xch_source_coin.amount = parseInt(cond[2], 16);
        } else { // check if CAT source parent
            const uncurryRes = GreenWeb.util.sexp.uncurry(
              coinSpend.puzzleReveal
            )
            if(uncurryRes === null) { continue; }
            
            const [uncurried_mod, args] = uncurryRes;
            if(GreenWeb.util.sexp.toHex(uncurried_mod) != CAT_MOD || args.length < 3) { continue; }

            tailHashHex = args[1].as_bin().hex().slice(2); // remove a0 (len) from bytes representation

            cat_source_coin_puzzle = getCATPuzzle(
              tailHashHex,
              GreenWeb.util.sexp.fromHex(OFFER_MOD)
            );
            cat_source_coin_puzzle_hash = GreenWeb.util.sexp.sha256tree(cat_source_coin_puzzle);

            if(cat_source_coin_puzzle_hash != cond[1]) { continue; }

            cat_source_coin.parentCoinInfo = GreenWeb.util.coin.getName(coinSpend.coin);
            cat_source_coin.puzzleHash = cat_source_coin_puzzle_hash;
            cat_source_coin.amount = parseInt(cond[2], 16);

            cat_source_coin_lineage_proof.parentCoinInfo = coinSpend.coin.parentCoinInfo;
            cat_source_coin_lineage_proof.puzzleHash = GreenWeb.util.sexp.sha256tree(args[2]); // inner puzzle hash
            cat_source_coin_lineage_proof.amount = coinSpend.coin.amount;
        }
      }
    }
  }

  if(tailHashHex === null) {
    console.log("Bridging XCH");
  } else {
    console.log("Bridging asset with id " + tailHashHex);
  }

  /* beign building spend bundle */
  var coin_spends = offer_sb.coinSpends;
  const sigs: string[] = [
    offer_sb.aggregatedSignature
  ];

  /* security coin adds a sig to this bundle so bundle_agg_sig != offer_agg_sig */
  /* it comes between the offer coin and the CAT burner coin */

  // https://gist.github.com/Yakuhito/d0e5bc4218138fcb183dfef4aaf3edd2
  const tempSeed = require('crypto').randomBytes(32).toString('hex');
  const mnemonic = GreenWeb.util.key.mnemonic.bytesToMnemonic(tempSeed);

  const tempSk = GreenWeb.util.key.mnemonic.privateKeyFromMnemonic(mnemonic);
  const tempPk = tempSk.get_g1();

  const securityCoinPuzzle = GreenWeb.util.sexp.standardCoinPuzzle(tempPk, true);
  const securityCoinPuzzleHash = GreenWeb.util.sexp.sha256tree(securityCoinPuzzle);

  const securityCoin = new GreenWeb.Coin();
  securityCoin.parentCoinInfo = GreenWeb.util.coin.getName(xch_source_coin);
  securityCoin.puzzleHash = securityCoinPuzzleHash;
  securityCoin.amount = bridging_toll_mojos;

    /* spend locker coin */
  const lockerPuzzle = getLockerPuzzle(
    destination_chain,
    wrapped_cat_address,
    portal_receiver_launcher_id,
    tailHashHex
  );
  const lockerPuzzleHash = GreenWeb.util.sexp.sha256tree(lockerPuzzle);

  const lockerCoin = new GreenWeb.Coin();
  lockerCoin.parentCoinInfo = GreenWeb.util.coin.getName(securityCoin);
  lockerCoin.puzzleHash = lockerPuzzleHash;
  lockerCoin.amount = bridging_toll_mojos;

  const lockerCoinName = GreenWeb.util.coin.getName(lockerCoin);
  const asset_amount = tailHashHex === null ?
    BigInt(xch_source_coin.amount.toString()) - BigInt(bridging_toll_mojos) : cat_source_coin.amount;
  const lockerCoinSolution = getLockerSolution(
    lockerCoin.amount,
    GreenWeb.util.coin.getName(lockerCoin),
    BigInt(asset_amount.toString()),
    target_recipient
  );

  const lockerCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  lockerCoinSpend.coin = lockerCoin;
  lockerCoinSpend.puzzleReveal = lockerPuzzle;
  lockerCoinSpend.solution = lockerCoinSolution;

  coin_spends.push(lockerCoinSpend);

  /* spend xch source coin = offer coin */
  const unlockerPuzzle = getUnlockerPuzzle(
    destination_chain,
    wrapped_cat_address,
    portal_receiver_launcher_id,
    tailHashHex
  );
  const unlockerPuzzleHash = GreenWeb.util.sexp.sha256tree(unlockerPuzzle);

  const p2ControllerPuzzleHashInnerPuzzle = getP2ControllerPuzzleHashInnerPuzzle(
    unlockerPuzzleHash
  );
  const p2ControllerPuzzleHashInnerPuzzleHash = GreenWeb.util.sexp.sha256tree(
    p2ControllerPuzzleHashInnerPuzzle
  );

  const payments = [
    [
      GreenWeb.util.sexp.bytesToAtom(
        GreenWeb.util.coin.getName(xch_source_coin)
      ),
      [
        GreenWeb.util.sexp.bytesToAtom(securityCoinPuzzleHash),
        BigInt(bridging_toll_mojos)
      ]
    ]
  ];
  if(tailHashHex === null) {
    payments.push([
      GreenWeb.util.sexp.bytesToAtom(lockerCoinName),
      [
        GreenWeb.util.sexp.bytesToAtom(p2ControllerPuzzleHashInnerPuzzleHash),
        BigInt(xch_source_coin.amount.toString()) - BigInt(bridging_toll_mojos)
      ]
    ]);
  }

  const xchSourceCoinSolution = SExp.to(payments);

  const xchSourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  xchSourceCoinSpend.coin = xch_source_coin;
  xchSourceCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(OFFER_MOD);
  xchSourceCoinSpend.solution = xchSourceCoinSolution;
  
  coin_spends.push(xchSourceCoinSpend);

  /* spend CAT coin, if present */
  if(tailHashHex !== null) {
    const catSourceCoinInnerSolution = SExp.to([
      [
        GreenWeb.util.sexp.bytesToAtom(
          lockerCoinName
        ),
        [
          GreenWeb.util.sexp.bytesToAtom(p2ControllerPuzzleHashInnerPuzzleHash),
          cat_source_coin.amount
        ]
      ],
    ]);

    const cat_source_coin_proof = new GreenWeb.Coin();
    cat_source_coin_proof.parentCoinInfo = cat_source_coin.parentCoinInfo;
    cat_source_coin_proof.puzzleHash = OFFER_MOD_HASH; // inner puzzle hash
    cat_source_coin_proof.amount = cat_source_coin.amount;

    const catSourceCoinSolution = getCATSolution(
      catSourceCoinInnerSolution,
      GreenWeb.util.coin.toProgram(cat_source_coin_lineage_proof),
      GreenWeb.util.coin.getName(cat_source_coin),
      cat_source_coin,
      cat_source_coin_proof,
      cat_source_coin.amount,
      0
    );

    const catSourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
    catSourceCoinSpend.coin = cat_source_coin;
    catSourceCoinSpend.puzzleReveal = cat_source_coin_puzzle as GreenWeb.clvm.SExp;
    catSourceCoinSpend.solution = catSourceCoinSolution;

    coin_spends.push(catSourceCoinSpend);
  }
  
  /* spend security coin */
  const securityCoinInnerConds = [
    GreenWeb.spend.assertCoinAnnouncementCondition(
      GreenWeb.util.stdHash(
        lockerCoinName + target_recipient
      ),
    ),
    SExp.to([
        GreenWeb.util.sexp.bytesToAtom("40"), // ASSERT_CONCURRENT_SPEND
        GreenWeb.util.sexp.bytesToAtom(lockerCoinName),
    ]),
    GreenWeb.spend.createCoinCondition(
      lockerCoin.puzzleHash,
      lockerCoin.amount
    ),
  ];
  const securityCoinSolution = GreenWeb.util.sexp.standardCoinSolution(
    securityCoinInnerConds
  );

  const securityCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  securityCoinSpend.coin = securityCoin;
  securityCoinSpend.puzzleReveal = securityCoinPuzzle;
  securityCoinSpend.solution = securityCoinSolution;
  
  coin_spends.push(securityCoinSpend);

  /* spend message coin */
  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = lockerCoinName;
  messageCoin.puzzleHash = BRIDGING_PUZZLE_HASH;
  messageCoin.amount = bridging_toll_mojos;
  
  const messageCoinSolution = SExp.to([
    messageCoin.amount
  ]);

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(BRIDGING_PUZZLE);
  messageCoinSpend.solution = messageCoinSolution;

  coin_spends.push(messageCoinSpend);

  /* lastly, aggregate sigs and build spend bundle */

  const { AugSchemeMPL, G2Element } = getBLSModule();

  // (list AGG_SIG_ME SYNTHETIC_PUBLIC_KEY (sha256tree1 delegated_puzzle))
  const securityDelegatedPuzzle = GreenWeb.util.sexp.run(
      GreenWeb.util.sexp.P2_CONDITIONS_PROGRAM,
      SExp.to([
          SExp.to(securityCoinInnerConds),
      ])
  );
  const securityDelegatedPuzzleHash = GreenWeb.util.sexp.sha256tree(securityDelegatedPuzzle);
  const dataToSign = securityDelegatedPuzzleHash + GreenWeb.util.coin.getName(securityCoin) + agg_sig_additional_data;
  const securityCoinSigRaw = AugSchemeMPL.sign(tempSk, Buffer.from(dataToSign, "hex"));
  const securityCoinSig = Buffer.from(
    securityCoinSigRaw.serialize()
  ).toString("hex");
  sigs.push(securityCoinSig);

  const sb = new GreenWeb.util.serializer.types.SpendBundle();
  sb.coinSpends = coin_spends;
  sb.aggregatedSignature = Buffer.from(
    AugSchemeMPL.aggregate(
      sigs.map((sig) => G2Element.from_bytes(Buffer.from(sig, "hex")))
    ).serialize()
  ).toString("hex");

  const nonce = GreenWeb.util.coin.getName(messageCoin);
  return [sb, nonce];
}
