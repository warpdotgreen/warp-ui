export interface asset {
  assetId: string
  amount: number
}

export interface createOfferParams {
  offerAssets: asset[]
  requestAssets: asset[]
  fee: number
}

export interface addCATParams {
  assetId: string
  symbol: string
  logoUrl: string
}