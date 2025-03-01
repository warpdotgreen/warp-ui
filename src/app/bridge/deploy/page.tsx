"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAccount } from "wagmi";
import { BASE_NETWORK } from "../config";
import { ContractFactory, getCreate2Address, hexlify, keccak256, sha256, toUtf8Bytes } from "ethers";
import { WrappedCATABI, WrappedCATBytecode } from "../drivers/abis";

export default function DeployPage() {
  const account = useAccount()

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
      70,
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
