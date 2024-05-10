import { defaultWagmiConfig } from "@web3modal/wagmi";
import { ethers } from "ethers";
import { http, createConfig } from 'wagmi'
import { sepolia, baseSepolia } from 'wagmi/chains'
import { getWrappedERC20AssetID } from "./drivers/erc20bridge";

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
  signatureThreshold: 3,
  validatorInfos: [
    "a60bffc4d51fa503ea6f12053a956de4cbb27a343453643e07eacddde06e7262e4fcd32653d61a731407a1d7e2d6ab2c",
    "89f91c357ce08b0cf4b191c1dea75917fa576a9713731f5d6623c28f421b26c6405b97f403f042100534f2546c12ba06",
    "85e07033fd3f31e73e476e21a3723434138a865edeab36e7debaea928f88ce14a05599d2ac5dfc41860b0159e6f7efb3",
    "a166b08281b6f29d858e1723a85ca4581740b09ad3f38f35db5038ebd06162cf45d41d13acb290b392db3b10dbb230eb",
    "944b6949e5af6bc4ecf37c858a3e1797f777528f58778aac0c2bf2ca7946273e3f2f1e90600f6fd05d68cc5747c8d9b9",
    "ac639eb21a717dfd51b1a0a84ba6febf0d359e61f960fbfc87796303d9e0f0c5ebb277b1713391adbfb0dbc3e0eb1bbc",
    "98fc5a235bd0880fb9f8de1fb57c67fd468ff2b1989edb1925e80ea359579a7668b6b77777b06d69c6ddfffd626407eb",
    "a1b99088e104d9a7c5c2c5638a9ea70f0c5b8e14be9b379520b5aa7a9286ae5472789fe2ac3a96288b2fa2c3105e1ec8",
    "aadb92c683f0e05bc75a106adfb604e1be75ab58ca10a5fe9f5e95cbd300302f213d63176f69427fbbc54d6146bd4b54",
    "97778660463afdee77fe8ff762faceefbd28b25506d26c584d9cd5a8eb77799fe5cc0b4df04c0004285868d5528aaba0"
  ],
  multisigThreshold: 3,
  multisigInfos: [
    "8a5c3c9d08d667775d0045335b8c90941763cd00a8cd6ed867c03db243da9b4c227a7012859b9355376df297bd5d8811",
    "8a31dd7d168290b7e4ce878fb42db54bdb4fe4b0f55f0c7208b138f96b8329706a44da6adba4e92b5c3bd6251436cd98",
    "b5bd04adb90273d97a458b5e42d4930ab35643203131c22d53ac312026da74fda64c71216fc6db263063262266c45727",
    "836324ba44d7e1f2290a1ccf4c3c2d064c5047619981198ec4059165d85c06a1fd214da2b1b58603254f9b48637a9db1",
    "8cf20247256572cd115607c773d0f02f2f2eb2bb8bc9fff6fef0459f71154dc9830c6286357c6d73974e65f50c280df4",
    "9322d4a1f8d078b81ea674947ba2420f4175f38483d7ac60dc3ff4de3d27cf33bb1c06cb7638467536ef766533a7ad79",
    "84b00e171a571b5904e48cdf456bf2861d37f01961c8b641a66974c70f49393fc55ba4b05543ca2894e8f6c7daad0719",
    "a56731d87b2240a9cfae3bc77e2af3c9f41fb7fca6393d721a2114041db03e58a6b986301c6281eb51d031a165ae5e1a",
    "813dcc8c4870df68416f14253a559aa0e088db84a46b9fe3e442eb6dbc2a1cb5381e2e862927a2743a1903889aadad1b",
    "8a8b61dcb5e2a8455e4b5d7782e70f96bc7667bccb4ea4a13492eb12244df2ec30f8785d579d9b0273461510bc0c497e"
  ],
  confirmationMinHeight: 5,
  prefix: "txch",
  portalLauncherId: "ed3ae61bacb1479b2ab8a771b758bc551ec8ba5c930bce002f30ae8a34a06abe",
  aggSigData: "37a90eb5185a9c4439a91ddc98bbadce7b4feba060d50116a067de66bf236615",
};

export const ETHEREUM_NETWORK: Network = {
  displayName: 'Ethereum',
  id: 'eth',
  type: NetworkType.EVM,
  chainId: sepolia.id,
  rpcUrl: 'https://rpc2.sepolia.org',
  explorerUrl: 'https://sepolia.etherscan.io',
  messageToll: ethers.parseEther("0.00001"),
  signatureThreshold: 3,
  validatorInfos: [
      "0x113f132a978B7679Aa72c02B0234a32569507043",
      "0xC1cF931aE32e7592fa25f5a0978B7663f20aafBd",
      "0xE42277e12F577810e73f70b42e184dd5BcD30ce6",
      "0x5110FB4762021ad3954Bdf2caBF4510C0ACd6d2f",
      "0x716f7ff65adcbBc68cb5bF34178C87aBC2B08ab6",
      "0x7d325C4783F9F572Fde31Ae358e28Cc3d120Cd8A",
      "0x92c02A599E056B2706f74421f4250951E1f736ab",
      "0xcF46Dd34bB1B1a4c5dCC9aEed02E494180C637f1",
      "0x144eE8FaB13Eed04b5A8F339105076B8BC51cAF2",
      "0xfB347BbC9C21CD71B0D86ffa99d2667372DBCa8B"
  ],
  confirmationMinHeight: 64,
  portalAddress: "0xB5651bA4DeaF815f5929243d6ACF99D2d7C113eb",
  erc20BridgeAddress: "0xc733F712288f8B20201846bbE979a715Ff8F8Fcb",
};

export const BASE_NETWORK: Network = {
  displayName: 'Base',
  id: 'bse',
  chainId: baseSepolia.id,
  type: NetworkType.EVM,
  rpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
  messageToll: ethers.parseEther("0.00001"),
  signatureThreshold: 3,
  validatorInfos: [
    "0x113f132a978B7679Aa72c02B0234a32569507043",
    "0xC1cF931aE32e7592fa25f5a0978B7663f20aafBd",
    "0xE42277e12F577810e73f70b42e184dd5BcD30ce6",
    "0x5110FB4762021ad3954Bdf2caBF4510C0ACd6d2f",
    "0x716f7ff65adcbBc68cb5bF34178C87aBC2B08ab6",
    "0x7d325C4783F9F572Fde31Ae358e28Cc3d120Cd8A",
    "0x92c02A599E056B2706f74421f4250951E1f736ab",
    "0xcF46Dd34bB1B1a4c5dCC9aEed02E494180C637f1",
    "0x144eE8FaB13Eed04b5A8F339105076B8BC51cAF2",
    "0xfB347BbC9C21CD71B0D86ffa99d2667372DBCa8B"
  ],
  confirmationMinHeight: 10,
  l1BlockContractAddress: "0x4200000000000000000000000000000000000015",
  portalAddress: "0xB0adb9dA8C730859cc659b4fda7Ec94b5884A4E1",
  erc20BridgeAddress: "0x895bef3757f7965D8AA9Fcb30Bd1539e03E4a24E",
};

export const NETWORKS = [
  CHIA_NETWORK,
  BASE_NETWORK,
  ETHEREUM_NETWORK
];

export type TokenInfo = {
  evmNetworkId: string,
  coinsetNetworkId: string,
  assetId: string,
  contractAddress: `0x${string}`
};

export type Token = {
  symbol: string,
  sourceNetworkType: NetworkType,
  supported: TokenInfo[]
};

const MILLIETH_ADDRESS_ETHEREUM: `0x${string}` = '0xFA2839748535B0eeAaCbbC932da6676DbFF45156';
const MILLIETH_ADDRESS_BASE: `0x${string}` = '0xE063EefEca08c1Ef7C42a90D39bA50A660a505C1';

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
};

const USDT_ADDRESS_ETHEREUM: `0x${string}` = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0';
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
};

const XCH_ASSET_ID = "00".repeat(32);
const WXCH_ADDRESS_ETHERUM : `0x${string}` = '0xEC6a48BD01E7B031050FB1d1F4246abfd31114FA';
const WXCH_ADDRESS_BASE : `0x${string}` = '0x092bA3a8CbF8126255E83f3D548085F9FB87F5C8';
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
    {
      evmNetworkId: BASE_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: XCH_ASSET_ID,
      contractAddress: WXCH_ADDRESS_BASE
    },
  ]
};

const DBX_ASSET_ID = "d82dd03f8a9ad2f84353cd953c4de6b21dbaaf7de3ba3f4ddd9abe31ecba80ad";
const WDBX_ADDRESS_ETHERUM : `0x${string}` = '0x5C5d6FA07c570DF689A34C9334B1DC9fe6E9dF1C';
const WDBX_ADDRESS_BASE : `0x${string}` = '0x2FD5f17f7F9284f1c12ff7bF45cB38df02519Ea5';
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
    {
      evmNetworkId: BASE_NETWORK.id,
      coinsetNetworkId: CHIA_NETWORK.id,
      assetId: DBX_ASSET_ID,
      contractAddress: WDBX_ADDRESS_BASE
    },
  ]
};


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
});

export const NOSTR_CONFIG = {
  relays: [
    "wss://test-relay.fireacademy.io",
  ],
  validatorKeys: [
    "cd5fd0859c3a27c13dd9734b7cdc6f2c25646e45821dcecaa089808803d01706",
    "804f399157512ee115d19e0e15fd63f97f6330755c6f928a8c49a6bda35df74e",
    "14aed9c23d7774dda60532891423e4e8adf74f468ea5f5cbac58cf8994387b94",
    "2239f413ce7b399ad1e91e2fb4742960d73637b87a3616c4a28771cc84fb648e",
    "6b8d53c62a1d5f9bc68605a7139c06c9ce6d727ecf815044b46cb983fcc17e52",
    "c26ce22c6241420e136b8562f9d89e73553a89f29ee15cb0194dd2be184601b8",
    "38c4190c961bfbc0a23b2c274c36fd6ccad5d50033e8bb263fc4aa23930ededf",
    "e492322cbbc745127af4bd59227d7e7d7b54a98d3a013d2072c4261dff319f88",
    "280e03462f0f87ba2aefeb7a033c2c1ec134fc9c06f28a5e9ed308dabf9e7700",
    "6f2aa84aa51327db3507e3c0d0fd02876d1b53fecf42aa88e9d32bbf5247ad3d"
  ]
}
