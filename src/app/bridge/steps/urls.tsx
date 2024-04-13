export function getStepOneURL({
  sourceNetworkId,
  destinationNetworkId,
  tokenSymbol,
  recipient,
  amount
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  tokenSymbol: string,
  recipient: string,
  amount: string,
}): string {
  const queryString = new URLSearchParams({
    step: "1",
    from: sourceNetworkId,
    to: destinationNetworkId,
    token: tokenSymbol,
    recipient,
    amount,
  }).toString();

  return `/bridge?${queryString}`;
}


export function getStepTwoURL({
  sourceNetworkId,
  destinationNetworkId,
  tx_hash
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  tx_hash: string,
}): string {
  const queryString = new URLSearchParams({
    step: "2",
    from: sourceNetworkId,
    to: destinationNetworkId,
    tx_hash
  }).toString();

  return `/bridge?${queryString}`;
}


export function getStepThreeURL({
  sourceNetworkId,
  destinationNetworkId,
  nonce,
  source,
  destination,
  contents,
  destTransactionId,
  offer,
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  nonce: string,
  source: string,
  destination: string,
  contents: any,
  destTransactionId?: string,
  offer?: string,
}): string {
  var params: any = {
    step: "3",
    from: sourceNetworkId,
    to: destinationNetworkId,
    nonce,
    source,
    destination,
    contents: JSON.stringify(contents),
  };

  if(destTransactionId) {
    params = {
      ...params,
      tx: destTransactionId!,
    };
  }
  if(offer) {
    params = {
      ...params,
      offer,
    };
  }

  const queryString = new URLSearchParams(params).toString();

  return `/bridge?${queryString}`;
}
