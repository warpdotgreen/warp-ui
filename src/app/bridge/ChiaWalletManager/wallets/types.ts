export interface asset {
  assetId: string
  amount: number
}

export interface createOfferParams {
  offerAssets: asset[]
  requestAssets: asset[]
}