"use client";

import { CHIA_NETWORK, NETWORKS, WATCHER_API_ROOT } from "@/app/bridge/config";
import { MessageResponse, typeToDisplayName } from "@/app/landingPageComponents/Messages";
import { getChainIcon, withToolTip } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns'
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import * as GreenWeb from 'greenwebjs'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStepThreeURL, getStepTwoURL } from "@/app/bridge/steps/urls";

export function MessageTableBody({
  sent
} : {
  sent: boolean
}) {
  const status = sent ? 'sent' : 'received';
  const limit = sent ? 7 : 16;
  const { data: messages, isLoading } = useQuery<MessageResponse[]>({
    queryKey: [`explorer_messages_${limit}_${sent}`],
    queryFn: () => fetch(`${WATCHER_API_ROOT}messages?limit=${limit}&status=${status}`).then(res => res.json()).then(
      (msgs) => msgs.filter((msg: MessageResponse) => msg.contents[0] !== "0000000000000000000000000000000000000000000000000000000000000000")
    ).then((msgs) => msgs.filter(
      (msg: MessageResponse) => !(msg.parsed.token_symbol === 'milliETH' && msg.parsed.amount_mojo === 1)
    )),
    refetchInterval: 10000
  })

  const makeMessageRow = (message: MessageResponse) => {
    const msgKey = message.source_chain + '-' + message.nonce;
    const sourceChain = NETWORKS.find((network) => network.id === message.source_chain)!;
    const destinationChain = NETWORKS.find((network) => network.id === message.destination_chain)!;

    const formatAddress = (chain: string, address: string): string => {
      return chain === 'xch' ?
        GreenWeb.util.address.puzzleHashToAddress(address, CHIA_NETWORK.prefix) :
        ethers.getAddress("0x" + address);
    }
    const messageSourceAddress = formatAddress(message.source_chain, message.source);
    const messageDestinationAddress = formatAddress(message.destination_chain, message.destination);

    const parsedContents =  message.parsed.token_symbol && message.parsed.amount_mojo ?
      `${ethers.formatUnits(BigInt(message.parsed.amount_mojo), message.parsed.token_symbol === 'XCH' ? 12 : 3)} ${message.parsed.token_symbol}` : '-';

    const timestamp = message.destination_timestamp ?? message.source_timestamp
    const timeAgo = formatDistanceToNow(timestamp * 1000, { addSuffix: true }).replace('about ', '')

    const messageCompleteLink = (() => {
      if(!sent) return '';

      const timeSinceMessage = Date.now() - timestamp * 1000;
      const windowForStep2 = 30 * 60 * 1000; // 30 minutes
      if(timeSinceMessage < windowForStep2) {
        return getStepTwoURL({
          sourceNetworkId: message.source_chain,
          destinationNetworkId: message.destination_chain,
          txHash: (message.source_chain === 'xch' ? '' : '0x') + message.source_transaction_hash,
        });
      }

      if(message.source_chain === "xch") {
        return getStepThreeURL({
          sourceNetworkId: message.source_chain,
          destinationNetworkId: message.destination_chain,
          nonce: message.nonce,
          source: message.source,
          destination: "0x" + message.destination,
          contents: message.contents
        });
      }

      return getStepThreeURL({
        sourceNetworkId: message.source_chain,
        destinationNetworkId: message.destination_chain,
        nonce: "0x" + message.nonce,
        source: "0x" + message.source,
        destination: "0x" + message.destination,
        contents: message.contents
      });
    })();

    // todo:
    // - copy button for nonce, source tx hash, from address, to address
    // - explorer link for source tx hahs, from address, to address (use network.explorerUrl - either etherscan/basescan or spacescan)
    // - realistic placeholder to be used when messages load
    // - pagination + load more?
    return (
      <tr key={msgKey}>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          0x{message.nonce.slice(0, 4)}...{message.nonce.slice(-4)}
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          0x{message.source_transaction_hash.slice(0, 4)}...{message.source_transaction_hash.slice(-4)}
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          <div className="flex items-center justify-left">
            {withToolTip(getChainIcon(sourceChain.displayName), sourceChain.displayName)}
            <div className="pl-2 text-left">
              <p className="text-md">{sourceChain.displayName}</p>
              <p className="text-md">{messageSourceAddress.slice(0, 4 + (message.source_chain === 'xch' ? 4 : 2))}...{messageSourceAddress.slice(-4)}</p>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          <div className="flex items-center justify-left">
            {withToolTip(getChainIcon(destinationChain.displayName), destinationChain.displayName)}
            <div className="pl-2 text-left">
              <p className="text-md">{destinationChain.displayName}</p>
              <p className="text-md">{messageDestinationAddress.slice(0, 4 + (message.destination_chain === 'xch' ? 4 : 2))}...{messageDestinationAddress.slice(-4)}</p>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          {typeToDisplayName.get(message.parsed.type) || 'Unknown App'}
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          {parsedContents}
        </td>
        <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          {timeAgo}
        </td>
        {sent && <td className="whitespace-nowrap px-3 py-8 text-sm text-center">
          <Button variant="outline">
            <Link href={messageCompleteLink}>Complete Relay</Link>
          </Button>
        </td>}
      </tr>
    );
  }

  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="text-center text-gray-500 py-5">Loading...</td>
      </tr>
    );
  }

  return (
    <>
      {messages!.map(makeMessageRow)}
    </>
  );
}
