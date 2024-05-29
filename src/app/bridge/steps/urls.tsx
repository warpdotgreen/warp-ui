export function getStepOneURL({
  sourceNetworkId,
  destinationNetworkId,
  tokenSymbol,
  recipient,
  amount,
  offer
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  tokenSymbol: string,
  recipient: string,
  amount: string,
  offer?: string
}): string {
  let params: any = {
    step: "1",
    from: sourceNetworkId,
    to: destinationNetworkId,
    token: tokenSymbol,
    recipient,
    amount,
  };

  if(offer) {
    params = {
      ...params,
      offer,
    };
  }

  const queryString = new URLSearchParams(params).toString();
  return `/bridge?${queryString}`;
}


export function getStepTwoURL({
  sourceNetworkId,
  destinationNetworkId,
  txHash,
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  txHash: string,
}): string {
  let params: any = {
    step: "2",
    from: sourceNetworkId,
    to: destinationNetworkId,
    tx: txHash
  };

  const queryString = new URLSearchParams(params).toString();
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
  portalBootstrapId
}: {
  sourceNetworkId: string,
  destinationNetworkId: string,
  nonce?: string,
  source?: string,
  destination?: string,
  contents?: any,
  destTransactionId?: string,
  offer?: string,
  portalBootstrapId?: string
}): string {
  var params: any = {
    step: "3",
    from: sourceNetworkId,
    to: destinationNetworkId,
  };

  if(nonce) {
    params = {
      ...params,
      nonce,
      source,
      destination,
      contents: JSON.stringify(contents),
    };
  }
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
      portal_bootstrap_id: portalBootstrapId!
    };
  }
  
  const queryString = new URLSearchParams(params).toString();

  return `/bridge?${queryString}`;
}
