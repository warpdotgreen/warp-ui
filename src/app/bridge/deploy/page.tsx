"use client"

import * as GreenWeb from 'greenwebjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Suspense, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { BASE_NETWORK, CHIA_NETWORK } from "../config";
import { concat, ContractFactory, getCreate2Address, hexlify, Interface, keccak256, parseEther, sha256, solidityPacked, toUtf8Bytes } from "ethers";
import { MultiSendABI, WrappedCATABI, WrappedCATBytecode } from "../drivers/abis";
import { getLockerPuzzle, getUnlockerPuzzle } from "../drivers/catbridge";

export default function DeployPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActualDeployPage />
    </Suspense>
  );
}

function ActualDeployPage() {
  const account = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [assetId, setAssetId] = useState('');
  const [chiaSymbol, setChiaSymbol] = useState('');

  const dataCompleted = assetId.length == 64 && chiaSymbol.length > 2;

  const deployPls = async () => {
    const symbol = `w${chiaSymbol}`;
    const name = `Chia Warped ${chiaSymbol}`;
    console.log({symbol, name, assetId})

    const mojoToTokenRatio = 1e15;
    const createCallAddress = BASE_NETWORK.createCallAddress!;
    const portalAddress = BASE_NETWORK.portalAddress!;

    const deploymentSalt = sha256(
      toUtf8Bytes(
        "you cannot imagine how many times yak manually changed this string during testing"
      )
    );

    const wrappedCatFactory = new ContractFactory(
      WrappedCATABI,
      WrappedCATBytecode
    );
    const deploymentTx = await wrappedCatFactory.getDeployTransaction(
      name,
      symbol,
      portalAddress,
      30,
      mojoToTokenRatio,
      hexlify(toUtf8Bytes("xch"))
    );
    const deploymentTxData = deploymentTx.data;

    const initCodeHash = keccak256(deploymentTxData);
    const predictedAddress = getCreate2Address(
      createCallAddress,
      deploymentSalt,
      initCodeHash
    );
    console.log("Predicted WrappedCAT address:", predictedAddress);

    const lockerPuzzleHash = GreenWeb.util.sexp.sha256tree(getLockerPuzzle(
      hexlify(toUtf8Bytes("bse")).replace("0x", ""),
      predictedAddress.replace("0x", ""),
      CHIA_NETWORK.portalLauncherId!.replace("0x", ""),
      assetId
    ));

    console.log("Locker puzzle hash:", lockerPuzzleHash);

    const unlockerPuzzleHash = GreenWeb.util.sexp.sha256tree(getUnlockerPuzzle(
      hexlify(toUtf8Bytes("bse")).replace("0x", ""),
      predictedAddress.replace("0x", ""),
      CHIA_NETWORK.portalLauncherId!.replace("0x", ""),
      assetId
    ));

    console.log("Unlocker puzzle hash:", unlockerPuzzleHash);

    const CreateCallABI = [
      "function performCreate2(uint256 value, bytes memory deploymentData, bytes32 salt) external returns (address)"
    ];
    const createCallInterface = new Interface(CreateCallABI);
    const deployData = createCallInterface.encodeFunctionData("performCreate2", [
      0,
      deploymentTxData,
      deploymentSalt
    ]);
    
    const deployDataSize = Math.floor(deployData.replace("0x", "").length / 2);
    const deployTxEncoded = solidityPacked(
      ["uint8", "address", "uint256", "uint256", "bytes"],
      [0, createCallAddress, 0, deployDataSize, deployData]
    );

    const wrappedCatInterface = new Interface(WrappedCATABI);
    const initData = wrappedCatInterface.encodeFunctionData("initializePuzzleHashes", [
      `0x${lockerPuzzleHash}`,
      `0x${unlockerPuzzleHash}`,
    ]);

    const initDataSize = Math.floor(initData.replace("0x", "").length / 2);
    const initTxEncoded = solidityPacked(
      ["uint8", "address", "uint256", "uint256", "bytes"],
      [0, predictedAddress, 0, initDataSize, initData]
    );
  
    console.log("Calling multiSend...")
    const transactions = concat([deployTxEncoded, initTxEncoded]);
    const resp = await writeContractAsync({
      address: BASE_NETWORK.multiCallAddress!,
      abi: MultiSendABI,
      functionName: "multiSend",
      args: [
        transactions as `0x${string}`
      ],
      value: BigInt(0),
      chainId: BASE_NETWORK.chainId!
    });
    console.log({ resp })
  }

  return (
    <div className="max-w-xl flex flex-col justify-center mx-auto w-full break-words grow">
      <div className="rounded-lg flex flex-col gap-4 p-6 ">
        <h1 className="text-2xl font-bold">Deploy a Wrapped CAT Contract</h1>
        <p className="text-muted-foreground mb-8">
          For more information, please see <a className="underline" href="https://docs.warp.green/users/creating-a-new-wrapped-cat" target="_blank">this page</a>.
        </p>
        <p>CAT asset id on Chia (TAIL hash):</p>
        <div className="flex items-center h-14 w-full gap-2 mb-4">
          <Input
            type="text"
            placeholder="Asset ID"
            className="text-xl h-full border-0"
            pattern="^\d*(\.\d{0,8})?$"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          />
        </div>
        <p>CAT symbol on Chia (usually 3-4 characters):</p>
        <div className="flex items-center h-14 w-full gap-2 mb-8">
          <Input
            type="text"
            placeholder="Symbol"
            className="text-xl h-full border-0"
            pattern="^\d*(\.\d{0,8})?$"
            value={chiaSymbol}
            onChange={(e) => setChiaSymbol(e.target.value)}
          />
        </div>

        <div className={cn("mx-8 flex justify-center", account?.address == undefined  || dataCompleted && 'cursor-not-allowed')}>
          {
            <Button
              type="submit"
              className="w-full h-14 bg-theme-purple hover:bg-theme-purple text-primary hover:opacity-80 text-xl"
              onClick={deployPls}
              disabled={account?.address == undefined  || !dataCompleted}
            >
              {
                account?.address == undefined ? "Connect Base Wallet First"
                  :
                  dataCompleted ? "Deploy" : "Complete Info First"
              }
            </Button>
          }
        </div>
      </div>
    </div>
  )

}
