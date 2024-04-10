import { defaultWagmiConfig } from "@web3modal/wagmi";
import { ethers } from "ethers";
import { http, createConfig } from 'wagmi'
import { sepolia, baseSepolia } from 'wagmi/chains'

export const TESTNET = true;

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
  messageFee: bigint,
  signatureThreshold: number,
  validatorInfos: string[], // public key or address
  confirmationMinHeight: number,

  // Chia only
  prefix?: string,
  bridgingPuzzleHash?: string,
  portalLauncherId?: string,
  aggSigData?: string,

  // EVM only
  portalAddress?: string,
  erc20BridgeAddress?: string,
  l1BlockContractAddress?: string // Optimism L2 only
}

export const CHIA_NETWORK: Network = {
  displayName: 'Chia',
  id: 'xch',
  type: NetworkType.COINSET,
  rpcUrl: 'http://localhost:5000/',
  messageFee: BigInt(1000000000),
  signatureThreshold: 1,
  validatorInfos: [
    "a60bffc4d51fa503ea6f12053a956de4cbb27a343453643e07eacddde06e7262e4fcd32653d61a731407a1d7e2d6ab2c",
    "b38dc1238afb47296ea89d57c9355be08fa7cf6e732d9d234f234a20473c8576c1cb851d7e756a75c2af0b7fb3110e30",
    "9796fa4b1fa20600e1ab44f5ff77aec6d48ab27e0af89009f269cb918fa2afd2b4bb00dc2560f643cd7e53d786d69c65"
  ],
  confirmationMinHeight: 1,
  prefix: "txch",
  bridgingPuzzleHash: "ac0dc3716c3d9fe85a27805f5c49aed6f903a1191458f552f331a08595c4ee4f",
  portalLauncherId: "2897cd458b03dcf30d42f4bd8a0f3509d2edb541efccd426cf5c831f8ce05005",
  aggSigData: "37a90eb5185a9c4439a91ddc98bbadce7b4feba060d50116a067de66bf236615",
};

export const BASE_NETWORK: Network = {
  displayName: 'Base',
  id: 'bse',
  type: NetworkType.EVM,
  rpcUrl: 'https://sepolia.base.org',
  messageFee: ethers.parseEther("0.00001"),
  signatureThreshold: 1,
  validatorInfos: [
    "0x113f132a978B7679Aa72c02B0234a32569507043",
    "0x5C6BB61AFfEF75C358d432fdE36580824E355036",
    "0x974937Abe6B517968b8614D1E19e75FB106327f2"
  ],
  confirmationMinHeight: 5,
  portalAddress: "0xf2bE8EB1225803E721aC20A98e97A1CAa1817e33",
  erc20BridgeAddress: "0xBaF8071bCEfbd8e21dF9E569258abF2bAc5608F3",
  l1BlockContractAddress: "0x4200000000000000000000000000000000000015"
};

export const ETHEREUM_NETWORK: Network = {
  displayName: 'Ethereum',
  id: 'eth',
  type: NetworkType.EVM,
  rpcUrl: 'https://rpc2.sepolia.org',
  messageFee: ethers.parseEther("0.00001"),
  signatureThreshold: 1,
  validatorInfos: [
    "0x113f132a978B7679Aa72c02B0234a32569507043",
    "0x5C6BB61AFfEF75C358d432fdE36580824E355036",
    "0x974937Abe6B517968b8614D1E19e75FB106327f2"
  ],
  confirmationMinHeight: 5,
  portalAddress: "0x5825DA09dE43BC6bAfDf6cf22e1C87302e86e665",
  erc20BridgeAddress: "0xbaCa882c82BEb9Da181C85eA81c825dBF591AFaA",
};

export const NETWORKS = [
  CHIA_NETWORK,
  BASE_NETWORK,
  ETHEREUM_NETWORK
];

export type TokenInfo = {
  sourceNetworkId: string,
  destinationNetworkId: string,
  assetId: string,
  contractAddress: string
};

export type Token = {
  symbol: string,
  supported: TokenInfo[]
};

export const ETH_TOKEN: Token = {
  symbol: 'ETH',
  supported: [
    // {
    //   source_network_id: 'eth',
    //   destination_network_id: 'xch',
    //   asset_id: 'eth',
    //   contract_address: ''
    // }
    {
      sourceNetworkId: 'bse',
      destinationNetworkId: 'xch',
      assetId: 'ddb39b5ba8fcbc58b4b06be6978d61536365e50a3563566c1d2c896ab1062788',
      contractAddress: '0xa2dC46aC13A4E153e66DeF2b6C6168919d349e42'
    }
  ]
};

export const TOKENS = [
  ETH_TOKEN
]

declare module 'wagmi' { 
  interface Register { 
    config: typeof wagmiConfig 
  } 
}

export const WALLETCONNECT_PROJECT_ID = 'e47a64f2fc7214f6c9f71b8b71e5e786';

const metadata = {
  name: 'warp.green Bridge Interface',
  description: 'Bridging powered by the warp.green cross-chain messaging protocol',
  url: 'https://warp.green',
  icons: []
}

export const wagmiConfig = defaultWagmiConfig({
  chains: [sepolia, baseSepolia],
  projectId: WALLETCONNECT_PROJECT_ID,
  ssr: true,
  metadata,
  transports: {
    [sepolia.id]: http(ETHEREUM_NETWORK.rpcUrl),
    [baseSepolia.id]: http(BASE_NETWORK.rpcUrl),
  },
})
