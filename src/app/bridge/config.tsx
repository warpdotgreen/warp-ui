import { defaultWagmiConfig } from "@web3modal/wagmi"
import { ethers } from "ethers"
import { http, createConfig } from 'wagmi'
import { sepolia, baseSepolia } from 'wagmi/chains'
import { getWrappedERC20AssetID } from "./drivers/erc20bridge"

export const TESTNET = true

export enum NetworkType {
  COINSET = 'coinset',
  EVM = 'evm'
}

export type Network = {
  // basic (needed for all networks)
  displayName: string,
  id: string,
  type: NetworkType,
  rpcUrl: string,
  explorerUrl: string,
  messageToll: bigint,
  signatureThreshold: number,
  validatorInfos: string[], // public key or address
  confirmationMinHeight: number,

  // Chia only
  prefix?: string,
  portalLauncherId?: string,
  aggSigData?: string,
  multisigThreshold?: number,
  multisigInfos?: string[],

  // EVM only
  chainId?: number,
  portalAddress?: `0x${string}`,
  erc20BridgeAddress?: `0x${string}`,
  l1BlockContractAddress?: `0x${string}` // Optimism L2 only
}

export const CHIA_NETWORK: Network = {
  displayName: 'Chia',
  id: 'xch',
  type: NetworkType.COINSET,
  rpcUrl: 'https://testnet.fireacademy.io/',
  explorerUrl: 'https://testnet11.spacescan.io/',
  messageToll: BigInt(1000000000),
  signatureThreshold: 1,
  validatorInfos: [
    "a60bffc4d51fa503ea6f12053a956de4cbb27a343453643e07eacddde06e7262e4fcd32653d61a731407a1d7e2d6ab2c",
    "b38dc1238afb47296ea89d57c9355be08fa7cf6e732d9d234f234a20473c8576c1cb851d7e756a75c2af0b7fb3110e30",
    "9796fa4b1fa20600e1ab44f5ff77aec6d48ab27e0af89009f269cb918fa2afd2b4bb00dc2560f643cd7e53d786d69c65"
  ],
  multisigThreshold: 1,
  multisigInfos: [
    "b93c773fd448927ad5a77d543aa9a2043dad8ab9d8a8ac505317d6542ffdb1b6b74e9e85e734b8ca8264de49b6231a38",
    "b38dc1238afb47296ea89d57c9355be08fa7cf6e732d9d234f234a20473c8576c1cb851d7e756a75c2af0b7fb3110e30",
    "8a5c3c9d08d667775d0045335b8c90941763cd00a8cd6ed867c03db243da9b4c227a7012859b9355376df297bd5d8811"
  ],
  confirmationMinHeight: 3,
  prefix: "txch",
  portalLauncherId: "9229ce0989917cacd6af54c62b26fa1e56cf7505f61801e04c5b00a7f2c5b138",
  aggSigData: "37a90eb5185a9c4439a91ddc98bbadce7b4feba060d50116a067de66bf236615",
}

export const ETHEREUM_NETWORK: Network = {
  displayName: 'Ethereum',
  id: 'eth',
  type: NetworkType.EVM,
  chainId: sepolia.id,
  rpcUrl: 'https://rpc2.sepolia.org',
  explorerUrl: 'https://sepolia.etherscan.io',
  messageToll: ethers.parseEther("0.00001"),
  signatureThreshold: 1,
  validatorInfos: [
    "0x113f132a978B7679Aa72c02B0234a32569507043",
    "0x5C6BB61AFfEF75C358d432fdE36580824E355036",
    "0x974937Abe6B517968b8614D1E19e75FB106327f2"
  ],
  confirmationMinHeight: 5,
  portalAddress: "0x67e99b36a37d7794180180c5b31F7cb97b019798",
  erc20BridgeAddress: "0x1bB5a805b2C9be93b71b80F50bB066A11cB2B3d6",
}

export const BASE_NETWORK: Network = {
  displayName: 'Base',
  id: 'bse',
  chainId: baseSepolia.id,
  type: NetworkType.EVM,
  rpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
  messageToll: ethers.parseEther("0.00001"),
  signatureThreshold: 1,
  validatorInfos: [
    "0x113f132a978B7679Aa72c02B0234a32569507043",
    "0x5C6BB61AFfEF75C358d432fdE36580824E355036",
    "0x974937Abe6B517968b8614D1E19e75FB106327f2"
  ],
  confirmationMinHeight: 10,
  l1BlockContractAddress: "0x4200000000000000000000000000000000000015",
  portalAddress: "0x9eeD3bdA5Dac7Eb4E7648e823e0C182536E1f260",
  erc20BridgeAddress: "0xDFC30105D48C403E0e69730C04a36b437972009b",
}

export const NETWORKS = [
  CHIA_NETWORK,
  BASE_NETWORK,
  ETHEREUM_NETWORK
]

export type TokenInfo = {
  evmNetworkId: string,
  coinsetNetworkId: string,
  assetId: string,
  contractAddress: `0x${string}`
}

export type Token = {
  symbol: string,
  sourceNetworkType: NetworkType,
  supported: TokenInfo[]
}

const MILLIETH_ADDRESS_ETHEREUM: `0x${string}` = '0x77c0B7bd331B754e3244840f5639b1B098a250Bb'
const MILLIETH_ADDRESS_BASE: `0x${string}` = '0x399a31D74572b4393DDe3B7486571633700226B2'

export const ETH_TOKEN: Token = {
  symbol: 'ETH',
  sourceNetworkType: NetworkType.EVM,
  supported: [
    {
      evmNetworkId: BASE_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: getWrappedERC20AssetID(BASE_NETWORK, MILLIETH_ADDRESS_BASE),
      contractAddress: MILLIETH_ADDRESS_BASE
    },
    {
      evmNetworkId: ETHEREUM_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: getWrappedERC20AssetID(ETHEREUM_NETWORK, MILLIETH_ADDRESS_ETHEREUM),
      contractAddress: MILLIETH_ADDRESS_ETHEREUM
    }
  ],
}

const USDT_ADDRESS_ETHEREUM: `0x${string}` = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
const USDT_TOKEN: Token = {
  symbol: 'USDT',
  sourceNetworkType: NetworkType.EVM,
  supported: [
    {
      evmNetworkId: ETHEREUM_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: getWrappedERC20AssetID(ETHEREUM_NETWORK, USDT_ADDRESS_ETHEREUM),
      contractAddress: USDT_ADDRESS_ETHEREUM
    },
  ]
}

const XCH_ASSET_ID = "00".repeat(32)
const WXCH_ADDRESS_ETHERUM: `0x${string}` = '0xFD45fef1C1829FEd9256f765A030Ef50a41d4204'
export const XCH_TOKEN: Token = {
  symbol: 'XCH',
  sourceNetworkType: NetworkType.COINSET,
  supported: [
    {
      evmNetworkId: ETHEREUM_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: XCH_ASSET_ID,
      contractAddress: WXCH_ADDRESS_ETHERUM
    },
  ]
}

const DBX_ASSET_ID = "d82dd03f8a9ad2f84353cd953c4de6b21dbaaf7de3ba3f4ddd9abe31ecba80ad"
const WDBX_ADDRESS_ETHERUM: `0x${string}` = '0x44a63DED7582De03C44c1b8AC8492373C8b3E974'
export const DBX_TOKEN: Token = {
  symbol: 'DBX',
  sourceNetworkType: NetworkType.COINSET,
  supported: [
    {
      evmNetworkId: ETHEREUM_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: DBX_ASSET_ID,
      contractAddress: WDBX_ADDRESS_ETHERUM
    },
  ]
}


export const TOKENS = [
  ETH_TOKEN,
  USDT_TOKEN,
  XCH_TOKEN,
  DBX_TOKEN
]

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}

export const WALLETCONNECT_PROJECT_ID = 'e47a64f2fc7214f6c9f71b8b71e5e786'

export const WcMetadata = {
  name: 'warp.green Bridge Interface',
  description: 'Bridging powered by the warp.green cross-chain messaging protocol',
  url: 'https://warp.green',
  icons: ['https://testnet.warp.green/warp-green-logo.png']
}

export const wagmiConfig = defaultWagmiConfig({
  chains: [sepolia, baseSepolia],
  projectId: WALLETCONNECT_PROJECT_ID,
  ssr: true,
  metadata: WcMetadata,
  transports: {
    [sepolia.id]: http(ETHEREUM_NETWORK.rpcUrl),
    [baseSepolia.id]: http(BASE_NETWORK.rpcUrl),
  },
})

export const NOSTR_CONFIG = {
  relays: [
    "wss://test-relay.fireacademy.io",
  ],
  validatorKeys: [
    "cd5fd0859c3a27c13dd9734b7cdc6f2c25646e45821dcecaa089808803d01706",
    "cd5b89f9280909e6e85713054094ac0e82b8c13a3a190de677d17285085cb833",
    "ed5cbb8a2aeb6050b9b942ae7a3595eadf82cfe72bb52448d47f0b25d14d995b",
  ]
}
