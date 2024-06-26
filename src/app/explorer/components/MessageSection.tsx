import { MessageTableBody } from "./MessageTableBody";

export function MessageSection({
  sent
} : {
  sent: boolean
}) {
  return (
    <div className="max-w-7xl min-w-3xl mx-auto px-8 overflow-x-auto">
      <div className="mt-4 text-xl">{sent ? 'Sent' : 'Received'} Messages</div>
      <div className="flow-root px-4">
        <table className="min-w-full divide-y divide-zinc-900 mt-4">
          <thead>
            <tr className="bg-zinc-900">
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold sm:pl-0 uppercase">Nonce</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">Source Tx Hash</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">From</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">To</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">App</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">Parsed Contents</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm text-theme-purple font-semibold uppercase">Time</th>
              <th scope="col" className="relative px-3 py-3.5">
                <span className="sr-only">Complete</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            <MessageTableBody sent={sent} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
