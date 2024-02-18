"use client";
import Image from "next/image";
import { useState } from 'react';
import { findLatestPortalState } from '../util/portal_receiver';  

export default function Home() {
  const [offer, setOffer] = useState('');

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(offer);
  };

  const fetchPortalInfo = async () => {
    const { coinId, nonces } = await findLatestPortalState();
    document.getElementById('coin-id-text')!.innerText = `Coin Id: ${coinId}`;
    document.getElementById('nonces-text')!.innerText = `Nonces: ${JSON.stringify(nonces)}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-48">
      <div className="flex flex-col space-y-4 w-full pb-16">
        <label className="text-lg font-semibold">Portal Coin</label>
        <p id="coin-id-text">Coin Id: click button below</p>
        <p id="nonces-text">Nonces: click button below</p>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={fetchPortalInfo}
        >Fetch Latest Portal Coin</button>
      </div>
      <form onSubmit={handleOfferSubmit} className="flex flex-col space-y-4 w-full">
        <label htmlFor="offer" className="block text-lg font-semibold">Offer</label>
        <input
          id="offer"
          type="text"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Enter your offer"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button type="submit" className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Submit</button>
      </form>
    </main>
  );
}
