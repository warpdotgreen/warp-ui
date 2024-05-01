import { offerToSpendBundle } from "./offer";
import * as GreenWeb from 'greenwebjs';
import { SExp, Tuple, Bytes, getBLSModule } from "clvm";
import { ConditionOpcode } from "greenwebjs/util/sexp/condition_opcodes";
import { CHIA_NETWORK, Network } from "../config";
import { BigNumberish } from "ethers";

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
      BigInt(cat_source_coin.amount.toString()),
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

export function unlockCATs(
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
  locked_coins: any[],
  locked_coin_proofs: any[],
  agg_sig_additional_data: string,
  assetId: string | null,
) {
  const {
    nonce,
    destination,
    contents
  } = message;
  const [xchReceiverPh, tokenAmount] = contents;
  const tokenAmountInt = parseInt(tokenAmount, 16);
  const offer_sb = offerToSpendBundle(offer);

  locked_coins = locked_coins.map((coin: any) => GreenWeb.util.goby.parseGobyCoin({
    parent_coin_info: GreenWeb.util.unhexlify(coin.parent_coin_info),
    puzzle_hash: GreenWeb.util.unhexlify(coin.puzzle_hash),
    amount: coin.amount
  })!);
  locked_coin_proofs = locked_coin_proofs.map((coin: any) => GreenWeb.util.goby.parseGobyCoin({
    parent_coin_info: GreenWeb.util.unhexlify(coin.parent_coin_info),
    puzzle_hash: GreenWeb.util.unhexlify(coin.puzzle_hash),
    amount: coin.amount
  })!);

  /* find source coin = coin with OFFER_MOD that will create security coin */
  var source_coin = new GreenWeb.Coin();
  var source_coin_parent_puzzle_hash;

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
        source_coin.amount = 1;
        source_coin_parent_puzzle_hash = coinSpend.coin.puzzleHash;
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

  /* spend source coin to create security coin */
  /* security coin adds a sig to this bundle so bundle_agg_sig != offer_agg_sig */
  /* it comes between the offer coin and the unlocker coin */

  // https://gist.github.com/Yakuhito/d0e5bc4218138fcb183dfef4aaf3edd2
  const tempSeed = require('crypto').randomBytes(32).toString('hex');
  const mnemonic = GreenWeb.util.key.mnemonic.bytesToMnemonic(tempSeed);

  const tempSk = GreenWeb.util.key.mnemonic.privateKeyFromMnemonic(mnemonic);
  const tempPk = tempSk.get_g1();

  const securityCoinPuzzle = GreenWeb.util.sexp.standardCoinPuzzle(tempPk, true);
  const securityCoinPuzzleHash = GreenWeb.util.sexp.sha256tree(securityCoinPuzzle);

  const securityCoin = new GreenWeb.Coin();
  securityCoin.parentCoinInfo = GreenWeb.util.coin.getName(source_coin);
  securityCoin.puzzleHash = securityCoinPuzzleHash;
  securityCoin.amount = source_coin.amount;

  const sourceCoinSolution = SExp.to([
    [
      GreenWeb.util.sexp.bytesToAtom(GreenWeb.util.coin.getName(securityCoin)),
      [
        GreenWeb.util.sexp.bytesToAtom(securityCoin.puzzleHash),
        securityCoin.amount
      ]
    ],
  ]);

  const sourceCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  sourceCoinSpend.coin = source_coin;
  sourceCoinSpend.puzzleReveal = GreenWeb.util.sexp.fromHex(OFFER_MOD);
  sourceCoinSpend.solution = sourceCoinSolution;

  coin_spends.push(sourceCoinSpend);

  /* spend unlocker coin */
  const unlockerPuzzle = getUnlockerPuzzle(
    source_chain,
    GreenWeb.util.unhexlify(source_contract)!,
    portal_receiver_launcher_id,
    assetId
  );
  const unlockerPuzzleHash = GreenWeb.util.sexp.sha256tree(unlockerPuzzle);

  const unlockerCoin = new GreenWeb.Coin();
  unlockerCoin.parentCoinInfo = GreenWeb.util.coin.getName(securityCoin);
  unlockerCoin.puzzleHash = unlockerPuzzleHash;
  unlockerCoin.amount = 0;

  const unlockerCoinName = GreenWeb.util.coin.getName(unlockerCoin);

  const unlockerCoinSolution = getUnlockerSolution(
    GreenWeb.util.coin.getName(portalCoinSpend.coin),
    nonce,
    xchReceiverPh,
    tokenAmount,
    unlockerPuzzleHash,
    unlockerCoinName,
    locked_coins.map((coin) => 
      [coin.parentCoinInfo, BigInt(coin.amount.toString())])
  );

  const unlockerCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  unlockerCoinSpend.coin = unlockerCoin;
  unlockerCoinSpend.puzzleReveal = unlockerPuzzle;
  unlockerCoinSpend.solution = unlockerCoinSolution;

  coin_spends.push(unlockerCoinSpend);

  /* spend locked coins */
  const p2ControllerPuzzleHashInnerPuzzle = getP2ControllerPuzzleHashInnerPuzzle(unlockerPuzzleHash);
  const p2ControllerPuzzleHashInnerPuzzleHash = GreenWeb.util.sexp.sha256tree(p2ControllerPuzzleHashInnerPuzzle);

  const p2ControllerPuzzleHashPuzzle = assetId == null ? p2ControllerPuzzleHashInnerPuzzle : getCATPuzzle(
    assetId,
    p2ControllerPuzzleHashInnerPuzzle
  );

  const totalVaultValue = locked_coins.reduce((acc, coin) => acc + BigInt(coin.amount.toString()), BigInt(0));

  const leadVaultConditions = [
    1, 
    GreenWeb.spend.createCoinCondition(
      xchReceiverPh,
      tokenAmountInt,
      [ xchReceiverPh ]
    )
  ];
  if(BigInt(tokenAmountInt) !== totalVaultValue) {
    leadVaultConditions.push(
      GreenWeb.spend.createCoinCondition(
        p2ControllerPuzzleHashInnerPuzzleHash,
        totalVaultValue - BigInt(tokenAmountInt)
      )
    );
  }
  const leadVaultDelegatedPuzzle = SExp.to(leadVaultConditions);

  console.log({leadVaultDelegatedPuzzle: GreenWeb.util.sexp.toHex(leadVaultDelegatedPuzzle)})

  const innerSolutions = locked_coins.map((lockedCoin, index) => {
    return getP2ControllerPuzzleHashInnerSolution(
      GreenWeb.util.coin.getName(lockedCoin),
      unlockerCoin.parentCoinInfo,
      BigInt(unlockerCoin.amount.toString()),
      index == locked_coins.length - 1 ? leadVaultDelegatedPuzzle : SExp.to([]),
      SExp.to([]) // delegated solution
    );
  });

  if(assetId === null) {
    innerSolutions.forEach((innerSolution, index) => {
      const cs = new GreenWeb.util.serializer.types.CoinSpend();
      cs.coin = locked_coins[index];
      cs.puzzleReveal = p2ControllerPuzzleHashPuzzle;
      cs.solution = innerSolution;

      coin_spends.push(cs);
    });
  } else {
    var amount_so_far = BigInt(0);
    locked_coins.forEach((lockedCoin, index) => {
      const innerSolution = innerSolutions[index];

      const nextCoin = locked_coins[(index + 1) % locked_coins.length];
      const nextCoinProof = new GreenWeb.Coin();
      nextCoinProof.parentCoinInfo = nextCoin.parentCoinInfo;
      nextCoinProof.puzzleHash = p2ControllerPuzzleHashInnerPuzzleHash;
      nextCoinProof.amount = nextCoin.amount;

      const solution = getCATSolution(
        innerSolution,
        GreenWeb.util.coin.toProgram(locked_coin_proofs[index]),
        GreenWeb.util.coin.getName(locked_coins[(locked_coins.length + index - 1) % locked_coins.length]),
        lockedCoin,
        nextCoinProof,
        index === 0 ? 0 : amount_so_far,
        0
      );
      amount_so_far += BigInt(lockedCoin.amount.toString());
      
      const cs = new GreenWeb.util.serializer.types.CoinSpend();
      cs.coin = lockedCoin;
      cs.puzzleReveal = p2ControllerPuzzleHashPuzzle;
      cs.solution = solution;

      coin_spends.push(cs);
    });
  }

  /* spend security coin */
  const securityCoinInnerConds = [
    SExp.to([
        GreenWeb.util.sexp.bytesToAtom("40"), // ASSERT_CONCURRENT_SPEND
        GreenWeb.util.sexp.bytesToAtom(unlockerCoinName),
    ]),
    GreenWeb.spend.createCoinCondition(
      source_coin_parent_puzzle_hash!,
      securityCoin.amount
    ),
    GreenWeb.spend.createCoinCondition(
      unlockerPuzzleHash,
      0
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

  const messageCoin = new GreenWeb.Coin();
  messageCoin.parentCoinInfo = GreenWeb.util.coin.getName(portalCoinSpend.coin);
  messageCoin.puzzleHash = GreenWeb.util.sexp.sha256tree(messageCoinPuzzle);
  messageCoin.amount = 0;

  const messageCoinSolution = getMessageCoinSolution(
    unlockerCoin,
    portalCoin.parent_coin_info,
    GreenWeb.util.sexp.sha256tree(portalInnerPuzzle),
    GreenWeb.util.coin.getName(messageCoin)
  );

  const messageCoinSpend = new GreenWeb.util.serializer.types.CoinSpend();
  messageCoinSpend.coin = messageCoin;
  messageCoinSpend.puzzleReveal = messageCoinPuzzle;
  messageCoinSpend.solution = messageCoinSolution;
  coin_spends.push(messageCoinSpend);

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

  // security coin sig
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
  // console.log( sbToString(sb) );

  return {
    sb,
    txId: GreenWeb.util.coin.getName(messageCoin)
  };
}
