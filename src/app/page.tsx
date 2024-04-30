"use client";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import TimeAgo from 'react-timeago';
import Link from "next/link";

const WATCHER_API_ROOT = 'https://test-watcher.fireacademy.io/';

const queryClient = new QueryClient()

export default function LandingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-zinc-950 h-screen text-zinc-100 flex flex-col justify-between snap-y snap-mandatory overflow-y-scroll no-scrollbar break-all">
        <div className="flex w-full justify-end py-4 px-8 fixed top-0 right-0 left-0 z-10">
          <Link
            href="/bridge"
            className="text-green-500 hover:bg-zinc-800 border-2 border-green-500 rounded-full font-medium px-4 py-2"
          >Bridging Interface</Link>
        </div>
        <div className="min-h-screen h-screen flex flex-col snap-center">
          <div className="flex-grow flex items-center">
              <div className="text-9xl pl-8 mt-24">
                  <h1>A Cross-Chain</h1>
                  <h1><span className="text-green-500">Messaging Protocol</span>.</h1>
              </div>
          </div>
          <div className="items-center justify-center pb-32 mb-8">
              <div className="text-center text-4xl">
                  warp.green allows your app to communicate across blockchains
              </div>
          </div>
          <div className="mx-auto pt-16 pb-4 flex items-center justify-center text-zinc-300">
              <CevronDoubleDownIcon /> 
              <p className="px-4">scroll down for more</p>
              <CevronDoubleDownIcon />
          </div>
        </div>
        <div className="min-h-screen h-screen snap-center">
          <SecondPageSection />          
        </div>
      </div>
    </QueryClientProvider>
  );
}

function SecondPageSection() {
  const { data: statsData, isLoading: isStatsDataLoading } = useQuery({
    queryKey: ['landingPage_stats'],
    queryFn: () => fetch(`${WATCHER_API_ROOT}stats`).then(res => res.json())
  });
  const { data: messages, isLoading: areMessagesLoading } = useQuery({
    queryKey: ['landingPage_latest-messages'],
    queryFn: () => fetch(`${WATCHER_API_ROOT}latest-messages?limit=4`).then(res => res.json()),
    refetchInterval: 10000
  });

  return (
    <div className="mx-4 mb-4 mt-16 pt-4 grid grid-cols-3 gap-16">
      <div>
        <>
          <h1 className="text-7xl">At a glance</h1>
          <h3 className="text-xl text-zinc-300 pt-6">A few points about warp.green</h3>
        </>
        <MainStatsCard
          statsData={statsData}
          isStatsDataLoading={isStatsDataLoading}
        />
        <SupportedNetworksCard />
      </div>
      <div>
        <>
          <h1 className="text-7xl">Live apps</h1>
          <h3 className="text-xl text-zinc-300 pt-6">Apps that use warp.green as an oracle</h3>
          <BridgeStatsCard
            cardName="ERC-20 Bridge"
            isDataLoading={isStatsDataLoading}
            tokenInfos={[
              ['ETH', statsData?.milliETH_locked ?? 0, statsData?.milliETH_total_volume ?? 0, 6],
              ['USDC', statsData?.USDC_locked ?? 0, statsData?.USDC_total_volume ?? 0, 3],
              ['USDT', statsData?.USDT_locked ?? 0, statsData?.USDT_total_volume ?? 0, 3],
            ]}
          />
          <BridgeStatsCard
            cardName="CAT Bridge"
            isDataLoading={isStatsDataLoading}
            tokenInfos={[
              // XCH has 12 decimals, but we don't want to show that many
              ['XCH', Math.floor((statsData?.XCH_locked ?? 0) / 1000000), Math.floor((statsData?.XCH_total_volume ?? 0) / 1000000), 6],
              ['SBX', statsData?.SBX_locked ?? 0, statsData?.SBX_total_volume ?? 0, 3],
              ['DBX', statsData?.DBX_locked ?? 0, statsData?.DBX_total_volume ?? 0, 3],
            ]}
          />
        </>
      </div>
      <div>
        <>
          <h1 className="text-7xl">Messages</h1>
          <h3 className="text-xl text-zinc-300 pt-6">Latest messages processed by warp.green</h3>
          <MessageBoard
            isLoading={areMessagesLoading}
            messages={messages}
          />
        </>
      </div>
    </div>
  );
}

function MessageBoard({
  isLoading,
  messages
} : {
  isLoading: boolean,
  messages: any
}) {
  if(isLoading) {
    return <></>;
  }
  return <div className="overflow-auto">
    {messages.map(({
      nonce, source_chain, destination_chain, source_timestamp, destination_timestamp, parsed
    }: {
      nonce: string,
      source_chain: string,
      destination_chain: string,
      source_timestamp: number,
      destination_timestamp?: number,
      parsed?: any
    }) => {
      const displayNonce = "0x" + nonce.slice(0, 4) + "..." + nonce.slice(-4);
      const timestamp = destination_timestamp ?? source_timestamp;

      const type = parsed?.type;

      const chainToDisplayName = new Map([
        ["eth", "Ethereum"],
        ["bse", "Base"],
        ["xch", "Chia"]
      ]);


      return (
        <div key={nonce} className="border-zinc-700 rounded-lg border p-4 bg-zinc-900 mt-8">
          <div className="flex justify-between">
            <p>
              Message <button onClick={() => {
                navigator.clipboard.writeText(nonce);
                alert('Message nonce copied to clipboard! :)');
              }} className="underline hover:text-zinc-300">{displayNonce}</button>
            </p>
            <p className="text-zinc-500">
              <span className={destination_timestamp === null ? 'text-yellow-300' : 'text-green-300'}>
                  {destination_timestamp === null ? 'sent' : 'received'}
              </span>{' '}
              <TimeAgo
                date={timestamp * 1000}
              />
            </p>
          </div>
          <div className="flex w-full pt-6">
            <div className="flex-1 flex flex-col justify-left items-center border-r border-zinc-700">
              <div className="text-md">{chainToDisplayName.get(source_chain)}</div>
              <div className="text-sm text-zinc-500">Source Chain</div>
            </div>

            <div className="flex-1 flex flex-col justify-left items-center border-r border-zinc-700">
              <div className="text-md">{chainToDisplayName.get(destination_chain)}</div>
              <div className="text-sm text-zinc-500">Destination Chain</div>
            </div>

            <div className="flex-1 flex flex-col justify-left items-center">
              <div className="text-md">{
              type === 'erc20_bridge' ? 'ERC-20 Bridge' : (
                type === 'cat_bridge' ? 'CAT Bridge' : 'Unknown'
              )}</div>
              <div className="text-sm text-zinc-500">App</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>;
}


function BridgeStatsCard({
  cardName,
  isDataLoading,
  tokenInfos
} : {
  cardName: string,
  isDataLoading: boolean,
  tokenInfos: [
    string, // token symbol
    number, // amount locked
    number, // total volume
    number, // digits
  ][]
}) {
  return (
    <div className="border-zinc-700 rounded-lg border p-4 bg-zinc-900 mt-8">
      <p className="text-center text-xl">{cardName}</p>
      <div className="flex flex-col mt-6 mx-4 pb-2">
        {tokenInfos.map(([tokenSymbol, amountLocked, totalVolume, digits], index) => {
          return (
            <div key={tokenSymbol} className={"flex w-full " + (index === tokenInfos.length - 1 ? "" : "border-b border-zinc-700")}>
              <div className="flex-1 flex flex-col justify-left py-2 items-center border-r border-zinc-700">
                <div className="text-2xl">{isDataLoading ? '...' : ethers.formatUnits(amountLocked, digits)} {tokenSymbol}</div>
                <div className="text-lg text-zinc-500">Locked</div>
              </div>

              <div className="flex-1 flex flex-col justify-left py-2 items-center">
                <div className="text-2xl">{isDataLoading ? '...' : ethers.formatUnits(totalVolume, digits)} {tokenSymbol}</div>
                <div className="text-lg text-zinc-500">Total Volume</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MainStatsCard({
  statsData,
  isStatsDataLoading,
} : {
  statsData: any,
  isStatsDataLoading: boolean,
}) {
  const totalMessages = isStatsDataLoading ? '...' : statsData?.total_messages.toString();
  const sentMessages = isStatsDataLoading ? '...' : statsData?.messages_to_chia.toString();
  const receivedMessages = isStatsDataLoading ? '...' : statsData?.messages_from_chia.toString();

  return (
    <div className="border-zinc-700 rounded-lg border p-4 bg-zinc-900 mt-8">
      <p className="text-center text-xl">Stats</p>
      <div className="flex flex-col mt-6 mx-4 pb-2">
        <div className="flex flex-col justify-center items-center mb-4">
          <div className="text-8xl">{totalMessages}</div>
          <div className="text-lg text-zinc-500">delivered messages</div>
        </div>

        <div className="flex w-full border-t border-zinc-700">
          <div className="flex-1 flex flex-col justify-left py-4 items-center border-r border-zinc-700">
            <div className="text-2xl">{sentMessages}</div>
            <div className="text-lg text-zinc-500">to Chia</div>
          </div>

          <div className="flex-1 flex flex-col justify-left py-4 items-center">
            <div className="text-2xl">{receivedMessages}</div>
            <div className="text-lg text-zinc-500">from Chia</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportedNetworksCard() {
  return (
    <div className="border-zinc-700 rounded-lg border p-4 bg-zinc-900 mt-8">
      <p className="text-center text-xl">Supported Networks</p>
      <div className="flex justify-between items-center mt-6 mx-8">
          <div className="relative">
              <div className="w-24 h-24 p-3 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                  <img src="https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg" alt="Network" className="w-full h-full rounded-full object-cover" />
              </div>
              <p className="text-center text-zinc-300 pt-2">Base</p>
          </div>
          <div className="w-full h-[2px] bg-zinc-700 flex-grow relative mb-8"></div>
          <div className="relative">
              <div className="w-24 h-24 p-2 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                  <img src="https://www.chia.net/wp-content/uploads/2023/06/chia_icon_green-hex5ECE71.svg?w=64" alt="Network" className="w-full h-full rounded-full object-cover" />
              </div>
              <p className="text-center text-zinc-300 pt-2">Chia</p>
          </div>
          <div className="w-full h-[2px] bg-zinc-700 flex-grow relative mb-8"></div>
          <div className="relative">
              <div className="w-24 h-24 p-3 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                  {/* <img src="https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/public/assets/eth-diamond-black-gray.png" alt="Network" className="w-full h-full rounded-full object-cover" /> */}
                  {/* <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" alt="Network" className="w-full h-full rounded-full object-cover" /> */}
                  <svg className="w-full h-full rounded-full object-cover" width="256px" height="417px" viewBox="0 0 256 417" version="1.1" preserveAspectRatio="xMidYMid">
                    <g>
                      <polygon fill="#343434" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"/>
                      <polygon fill="#8C8C8C" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"/>
                      <polygon fill="#3C3C3B" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"/>
                      <polygon fill="#8C8C8C" points="127.962 416.9052 127.962 312.1852 0 236.5852"/>
                      <polygon fill="#141414" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"/>
                      <polygon fill="#393939" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"/>
                    </g>
                  </svg>
              </div>
              <p className="text-center text-zinc-300 pt-2">Ethereum</p>
          </div>
      </div>
    </div>
  );
}


// https://heroicons.com/
function CevronDoubleDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
    </svg>
  );
}
