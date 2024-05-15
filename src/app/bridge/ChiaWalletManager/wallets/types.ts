export interface asset {
  assetId: string
  amount: number
}

export interface createOfferParams {
  offerAssets: asset[]
  requestAssets: asset[]
}

export interface addCATParams {
  assetId: string
  symbol: string
  logoUrl: string
}