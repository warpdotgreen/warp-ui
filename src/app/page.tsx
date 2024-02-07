"use client";
import Image from "next/image";
import { useState } from 'react';

export default function Home() {
  const [offer, setOffer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(offer);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
