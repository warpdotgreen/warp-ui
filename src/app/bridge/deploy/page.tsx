"use client"

import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function DeployPage() {
  const [assetId, setAssetId] = useState('');
  const [chiaSymbol, setChiaSymbol] = useState('');

  const dataCompleted = assetId && assetId.length == 64 && chiaSymbol && chiaSymbol.length > 2;

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
        <div className="flex items-center h-14 w-full gap-2">
          <Input
            type="text"
            placeholder="Symbol"
            className="text-xl h-full border-0"
            pattern="^\d*(\.\d{0,8})?$"
            value={chiaSymbol}
            onChange={(e) => setChiaSymbol(e.target.value)}
          />
        </div>
      </div>
    </div>
  )

}
