"use client";

export default function Home() {
  return (
    <div className="bg-black min-h-screen flex flex-col justify-between">
      <div className="flex justify-between px-8 py-4">
        <div className="text-green-500 text-xl font-light">warp.green</div>
        <div className="flex">
          <div className="w-8 h-8 rounded-full bg-blue-500 mr-2"></div>
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>

      <div className="max-w-sm mx-auto py-8">
        <div className="mx-auto border-green-500 rounded-lg border-2 p-4">
          <form className="space-y-5">
            <InputElement />

            <button
              type="button"
              className="block mx-auto p-2 border-2 border-green-500 rounded bg-black text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300"
            >
              &darr;
            </button>

            <InputElement />


            <button
              type="submit"
              className="w-full py-2 border-2 border-green-500 rounded bg-black text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300"
            >
              Bridge
            </button>
          </form>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <p className="text-green-500">Docs | Twitter | Terms</p>
      </div>
    </div>
  );
}

function InputElement() {
  return (
      <div className="flex items-center space-x-2 px-3 py-4 border-2 border-green-500 rounded">
        <input  
          type="text"
          placeholder="Amount"
          className="flex-shrink min-w-0 outline-none bg-black text-green-500 placeholder-green-500 text-lg"
        />
        <select className="flex-grow-0 px-3 py-2 border-2 border-green-500 rounded bg-black text-green-500 outline-none">
          <option>Chia</option>
          <option>Base</option>
          <option>Ethereum</option>
        </select>
        <select className="flex-grow-0 px-3 py-2 border-2 border-green-500 rounded bg-black text-green-500 outline-none">
          <option>ETH</option>
          <option>USDC</option>
        </select>
      </div>
    );
}
