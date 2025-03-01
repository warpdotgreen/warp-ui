export const ERC20BridgeABI = [
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "_tip",
          "type": "uint16"
        },
        {
          "internalType": "address",
          "name": "_portal",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_iweth",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "_wethToEthRatio",
          "type": "uint64"
        },
        {
          "internalType": "bytes3",
          "name": "_otherChain",
          "type": "bytes3"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "AddressInsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_receiver",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_maxMessageToll",
          "type": "uint256"
        }
      ],
      "name": "bridgeEtherToChia",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_assetContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "_receiver",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_mojoAmount",
          "type": "uint256"
        }
      ],
      "name": "bridgeToChia",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_assetContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "_receiver",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "_r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_s",
          "type": "bytes32"
        }
      ],
      "name": "bridgeToChiaWithPermit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "burnPuzzleHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_burnPuzzleHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_mintPuzzleHash",
          "type": "bytes32"
        }
      ],
      "name": "initializePuzzleHashes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "iweth",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mintPuzzleHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "otherChain",
      "outputs": [
        {
          "internalType": "bytes3",
          "name": "",
          "type": "bytes3"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "portal",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "bytes3",
          "name": "_source_chain",
          "type": "bytes3"
        },
        {
          "internalType": "bytes32",
          "name": "_source",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "_contents",
          "type": "bytes32[]"
        }
      ],
      "name": "receiveMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tip",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "wethToEthRatio",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ] as const;

export const L1BlockABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"DEPOSITOR_ACCOUNT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"basefee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"batcherHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"l1FeeOverhead","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"l1FeeScalar","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"number","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sequenceNumber","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"_number","type":"uint64"},{"internalType":"uint64","name":"_timestamp","type":"uint64"},{"internalType":"uint256","name":"_basefee","type":"uint256"},{"internalType":"bytes32","name":"_hash","type":"bytes32"},{"internalType":"uint64","name":"_sequenceNumber","type":"uint64"},{"internalType":"bytes32","name":"_batcherHash","type":"bytes32"},{"internalType":"uint256","name":"_l1FeeOverhead","type":"uint256"},{"internalType":"uint256","name":"_l1FeeScalar","type":"uint256"}],"name":"setL1BlockValues","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"timestamp","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}] as const;

export const PortalABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "AddressInsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ECDSAInvalidSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
        }
      ],
      "name": "ECDSAInvalidSignatureLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "ECDSAInvalidSignatureS",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes3",
          "name": "source_chain",
          "type": "bytes3"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "source",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "destination",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32[]",
          "name": "contents",
          "type": "bytes32[]"
        }
      ],
      "name": "MessageReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "source",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes3",
          "name": "destination_chain",
          "type": "bytes3"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "destination",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32[]",
          "name": "contents",
          "type": "bytes32[]"
        }
      ],
      "name": "MessageSent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "MessageTollUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newThreshold",
          "type": "uint256"
        }
      ],
      "name": "SignagtureThresholdUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isSigner",
          "type": "bool"
        }
      ],
      "name": "SignerUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes3",
          "name": "chainId",
          "type": "bytes3"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "supported",
          "type": "bool"
        }
      ],
      "name": "SupportedChainUpdated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
        {
          "internalType": "bytes1",
          "name": "fields",
          "type": "bytes1"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "version",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "verifyingContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[]",
          "name": "extensions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ethNonce",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_coldMultisig",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_messageToll",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "_signers",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "_signatureThreshold",
          "type": "uint256"
        },
        {
          "internalType": "bytes3[]",
          "name": "_supportedChains",
          "type": "bytes3[]"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isSigner",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "messageToll",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_nonce",
          "type": "bytes32"
        },
        {
          "internalType": "bytes3",
          "name": "_source_chain",
          "type": "bytes3"
        },
        {
          "internalType": "bytes32",
          "name": "_source",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_destination",
          "type": "address"
        },
        {
          "internalType": "bytes32[]",
          "name": "_contents",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes",
          "name": "_sigs",
          "type": "bytes"
        }
      ],
      "name": "receiveMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_assetContract",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "_receivers",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_amounts",
          "type": "uint256[]"
        }
      ],
      "name": "rescueAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "_receivers",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_amounts",
          "type": "uint256[]"
        }
      ],
      "name": "rescueEther",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes3",
          "name": "_destination_chain",
          "type": "bytes3"
        },
        {
          "internalType": "bytes32",
          "name": "_destination",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "_contents",
          "type": "bytes32[]"
        }
      ],
      "name": "sendMessage",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "signatureThreshold",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes3",
          "name": "",
          "type": "bytes3"
        }
      ],
      "name": "supportedChains",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newValue",
          "type": "uint256"
        }
      ],
      "name": "updateMessageToll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newValue",
          "type": "uint256"
        }
      ],
      "name": "updateSignatureThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_newValue",
          "type": "bool"
        }
      ],
      "name": "updateSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes3",
          "name": "_chainId",
          "type": "bytes3"
        },
        {
          "internalType": "bool",
          "name": "_supported",
          "type": "bool"
        }
      ],
      "name": "updateSupportedChain",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ] as const;

export const erc20ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
] as const;

export const WrappedCATABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_symbol",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_portal",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "_tip",
          "type": "uint16"
        },
        {
          "internalType": "uint64",
          "name": "_mojoToTokenRatio",
          "type": "uint64"
        },
        {
          "internalType": "bytes3",
          "name": "_otherChain",
          "type": "bytes3"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ECDSAInvalidSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
        }
      ],
      "name": "ECDSAInvalidSignatureLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "ECDSAInvalidSignatureS",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "ERC2612ExpiredSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC2612InvalidSigner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "currentNonce",
          "type": "uint256"
        }
      ],
      "name": "InvalidAccountNonce",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidShortString",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "str",
          "type": "string"
        }
      ],
      "name": "StringTooLong",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_receiver",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_mojoAmount",
          "type": "uint256"
        }
      ],
      "name": "bridgeBack",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
        {
          "internalType": "bytes1",
          "name": "fields",
          "type": "bytes1"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "version",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "verifyingContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[]",
          "name": "extensions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_lockerPuzzleHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_unlockerPuzzleHash",
          "type": "bytes32"
        }
      ],
      "name": "initializePuzzleHashes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockerPuzzleHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mojoToTokenRatio",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "otherChain",
      "outputs": [
        {
          "internalType": "bytes3",
          "name": "",
          "type": "bytes3"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "portal",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "bytes3",
          "name": "_source_chain",
          "type": "bytes3"
        },
        {
          "internalType": "bytes32",
          "name": "_source",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "_contents",
          "type": "bytes32[]"
        }
      ],
      "name": "receiveMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tip",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unlockerPuzzleHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

export const WrappedCATBytecode = "0x6101e06040523480156200001257600080fd5b5060405162001fce38038062001fce833981016040819052620000359162000383565b6040805180820190915260018152603160f81b60208201528690819081886003620000618382620004df565b506004620000708282620004df565b50620000829150839050600562000204565b610120526200009381600662000204565b61014052815160208084019190912060e052815190820120610100524660a0526200012160e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60805250503060c0525061ffff8316158015906200014557506103e88361ffff1611155b620001855760405162461bcd60e51b81526004016200017c906020808252600490820152630217469760e41b604082015260600190565b60405180910390fd5b6001600160a01b038416620001c75760405162461bcd60e51b8152602060048201526007602482015266085c1bdc9d185b60ca1b60448201526064016200017c565b6001600160a01b039093166101605261ffff909116610180526001600160401b03166101a0526001600160e81b0319166101c05250620006059050565b600060208351101562000224576200021c836200023d565b905062000237565b81620002318482620004df565b5060ff90505b92915050565b600080829050601f815111156200026b578260405163305a27a960e01b81526004016200017c9190620005ab565b80516200027882620005e0565b179392505050565b634e487b7160e01b600052604160045260246000fd5b60005b83811015620002b357818101518382015260200162000299565b50506000910152565b600082601f830112620002ce57600080fd5b81516001600160401b0380821115620002eb57620002eb62000280565b604051601f8301601f19908116603f0116810190828211818310171562000316576200031662000280565b816040528381528660208588010111156200033057600080fd5b6200034384602083016020890162000296565b9695505050505050565b80516001600160401b03811681146200036557600080fd5b919050565b80516001600160e81b0319811681146200036557600080fd5b60008060008060008060c087890312156200039d57600080fd5b86516001600160401b0380821115620003b557600080fd5b620003c38a838b01620002bc565b97506020890151915080821115620003da57600080fd5b50620003e989828a01620002bc565b604089015190965090506001600160a01b03811681146200040957600080fd5b606088015190945061ffff811681146200042257600080fd5b925062000432608088016200034d565b91506200044260a088016200036a565b90509295509295509295565b600181811c908216806200046357607f821691505b6020821081036200048457634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620004da576000816000526020600020601f850160051c81016020861015620004b55750805b601f850160051c820191505b81811015620004d657828155600101620004c1565b5050505b505050565b81516001600160401b03811115620004fb57620004fb62000280565b62000513816200050c84546200044e565b846200048a565b602080601f8311600181146200054b5760008415620005325750858301515b600019600386901b1c1916600185901b178555620004d6565b600085815260208120601f198616915b828110156200057c578886015182559484019460019091019084016200055b565b50858210156200059b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6020815260008251806020840152620005cc81604085016020870162000296565b601f01601f19169190910160400192915050565b80516020808301519190811015620004845760001960209190910360031b1b16919050565b60805160a05160c05160e05161010051610120516101405161016051610180516101a0516101c0516118ee620006e06000396000818161022d0152818161083a01526108df015260008181610491015281816106fe0152818161075b015261094e0152600081816101e60152818161067701526109ad0152600081816102e0015281816105ad0152818161072e0152818161080b015281816108a80152610a5101526000610f4801526000610f1b01526000610e5301526000610e2b01526000610d8601526000610db001526000610dda01526118ee6000f3fe6080604052600436106101355760003560e01c80636d705277116100ab578063a9059cbb1161006f578063a9059cbb146103c3578063d0cad76e146103e3578063d505accf146103f9578063dd62ed3e14610419578063f22e7bbd1461045f578063f6e7226a1461047f57600080fd5b80636d7052771461031a57806370a08231146103305780637ecebe001461036657806384b0196e1461038657806395d89b41146103ae57600080fd5b80633097316a116100fd5780633097316a1461021b578063313ce567146102685780633644e51514610284578063415d936114610299578063574632fc146102ae5780636425666b146102ce57600080fd5b806306fdde031461013a578063095ea7b31461016557806318160ddd1461019557806323b872dd146101b45780632755cd2d146101d4575b600080fd5b34801561014657600080fd5b5061014f6104cc565b60405161015c91906114a8565b60405180910390f35b34801561017157600080fd5b506101856101803660046114de565b61055e565b604051901515815260200161015c565b3480156101a157600080fd5b506002545b60405190815260200161015c565b3480156101c057600080fd5b506101856101cf366004611508565b610578565b3480156101e057600080fd5b506102087f000000000000000000000000000000000000000000000000000000000000000081565b60405161ffff909116815260200161015c565b34801561022757600080fd5b5061024f7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160e81b0319909116815260200161015c565b34801561027457600080fd5b506040516012815260200161015c565b34801561029057600080fd5b506101a661059c565b6102ac6102a7366004611544565b6105ab565b005b3480156102ba57600080fd5b506102ac6102c9366004611566565b61089d565b3480156102da57600080fd5b506103027f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200161015c565b34801561032657600080fd5b506101a660085481565b34801561033c57600080fd5b506101a661034b36600461160c565b6001600160a01b031660009081526020819052604090205490565b34801561037257600080fd5b506101a661038136600461160c565b610a7f565b34801561039257600080fd5b5061039b610a9d565b60405161015c9796959493929190611627565b3480156103ba57600080fd5b5061014f610ae3565b3480156103cf57600080fd5b506101856103de3660046114de565b610af2565b3480156103ef57600080fd5b506101a660095481565b34801561040557600080fd5b506102ac6104143660046116c0565b610b00565b34801561042557600080fd5b506101a6610434366004611733565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b34801561046b57600080fd5b506102ac61047a366004611544565b610c3a565b34801561048b57600080fd5b506104b37f000000000000000000000000000000000000000000000000000000000000000081565b60405167ffffffffffffffff909116815260200161015c565b6060600380546104db90611766565b80601f016020809104026020016040519081016040528092919081815260200182805461050790611766565b80156105545780601f1061052957610100808354040283529160200191610554565b820191906000526020600020905b81548152906001019060200180831161053757829003601f168201915b5050505050905090565b60003361056c818585610c8a565b60019150505b92915050565b600033610586858285610c9c565b610591858585610d1a565b506001949350505050565b60006105a6610d79565b905090565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166379c06b8b6040518163ffffffff1660e01b81526004016020604051808303816000875af115801561060b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061062f91906117a0565b341461066a5760405162461bcd60e51b8152602060048201526005602482015264085d1bdb1b60da1b60448201526064015b60405180910390fd5b600061271061069d61ffff7f000000000000000000000000000000000000000000000000000000000000000016846117cf565b6106a791906117e6565b9050806000036106b5575060015b8082116106ec5760405162461bcd60e51b815260206004820152600560248201526408585b5b9d60da1b6044820152606401610661565b6107293361072467ffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016856117cf565b610ea4565b6107867f000000000000000000000000000000000000000000000000000000000000000061078167ffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016846117cf565b610ede565b60408051600280825260608201835260009260208301908036833701905050905083816000815181106107bb576107bb611808565b60209081029190910101526107d0828461181e565b60001b816001815181106107e6576107e6611808565b602090810291909101015260095460405163b3882f8960e01b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169163b3882f89913491610865917f000000000000000000000000000000000000000000000000000000000000000091908790600401611831565b6000604051808303818588803b15801561087e57600080fd5b505af1158015610892573d6000803e3d6000fd5b505050505050505050565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161480156108d6575060085483145b801561091557507f00000000000000000000000000000000000000000000000000000000000000006001600160e81b031916846001600160e81b031916145b61094a5760405162461bcd60e51b815260040161066190602080825260049082015263216d736760e01b604082015260600190565b60007f000000000000000000000000000000000000000000000000000000000000000067ffffffffffffffff168383600181811061098a5761098a611808565b9050602002013560001c61099e91906117cf565b905060006127106109d361ffff7f000000000000000000000000000000000000000000000000000000000000000016846117cf565b6109dd91906117e6565b90506000811180156109ee57508082115b610a225760405162461bcd60e51b815260206004820152600560248201526408585b5b9d60da1b6044820152606401610661565b610a4c84846000818110610a3857610a38611808565b60200291909101359050610781838561181e565b610a767f000000000000000000000000000000000000000000000000000000000000000082610ede565b50505050505050565b6001600160a01b038116600090815260076020526040812054610572565b600060608060008060006060610ab1610f14565b610ab9610f41565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6060600480546104db90611766565b60003361056c818585610d1a565b83421115610b245760405163313c898160e11b815260048101859052602401610661565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9888888610b718c6001600160a01b0316600090815260076020526040902080546001810190915590565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090506000610bcc82610f6e565b90506000610bdc82878787610f9b565b9050896001600160a01b0316816001600160a01b031614610c23576040516325c0072360e11b81526001600160a01b0380831660048301528b166024820152604401610661565b610c2e8a8a8a610c8a565b50505050505050505050565b600854158015610c4a5750600954155b610c7f5760405162461bcd60e51b8152600401610661906020808252600490820152636e6f706560e01b604082015260600190565b600891909155600955565b610c978383836001610fc9565b505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610d145781811015610d0557604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610661565b610d1484848484036000610fc9565b50505050565b6001600160a01b038316610d4457604051634b637e8f60e11b815260006004820152602401610661565b6001600160a01b038216610d6e5760405163ec442f0560e01b815260006004820152602401610661565b610c9783838361109e565b6000306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015610dd257507f000000000000000000000000000000000000000000000000000000000000000046145b15610dfc57507f000000000000000000000000000000000000000000000000000000000000000090565b6105a6604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b6001600160a01b038216610ece57604051634b637e8f60e11b815260006004820152602401610661565b610eda8260008361109e565b5050565b6001600160a01b038216610f085760405163ec442f0560e01b815260006004820152602401610661565b610eda6000838361109e565b60606105a67f000000000000000000000000000000000000000000000000000000000000000060056111c8565b60606105a67f000000000000000000000000000000000000000000000000000000000000000060066111c8565b6000610572610f7b610d79565b8360405161190160f01b8152600281019290925260228201526042902090565b600080600080610fad88888888611273565b925092509250610fbd8282611342565b50909695505050505050565b6001600160a01b038416610ff35760405163e602df0560e01b815260006004820152602401610661565b6001600160a01b03831661101d57604051634a1406b160e11b815260006004820152602401610661565b6001600160a01b0380851660009081526001602090815260408083209387168352929052208290558015610d1457826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161109091815260200190565b60405180910390a350505050565b6001600160a01b0383166110c95780600260008282546110be919061188f565b9091555061113b9050565b6001600160a01b0383166000908152602081905260409020548181101561111c5760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610661565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661115757600280548290039055611176565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516111bb91815260200190565b60405180910390a3505050565b606060ff83146111e2576111db836113fb565b9050610572565b8180546111ee90611766565b80601f016020809104026020016040519081016040528092919081815260200182805461121a90611766565b80156112675780601f1061123c57610100808354040283529160200191611267565b820191906000526020600020905b81548152906001019060200180831161124a57829003601f168201915b50505050509050610572565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411156112ae5750600091506003905082611338565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa158015611302573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661132e57506000925060019150829050611338565b9250600091508190505b9450945094915050565b6000826003811115611356576113566118a2565b0361135f575050565b6001826003811115611373576113736118a2565b036113915760405163f645eedf60e01b815260040160405180910390fd5b60028260038111156113a5576113a56118a2565b036113c65760405163fce698f760e01b815260048101829052602401610661565b60038260038111156113da576113da6118a2565b03610eda576040516335e2f38360e21b815260048101829052602401610661565b606060006114088361143a565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b600060ff8216601f81111561057257604051632cd44ac360e21b815260040160405180910390fd5b6000815180845260005b818110156114885760208185018101518683018201520161146c565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006114bb6020830184611462565b9392505050565b80356001600160a01b03811681146114d957600080fd5b919050565b600080604083850312156114f157600080fd5b6114fa836114c2565b946020939093013593505050565b60008060006060848603121561151d57600080fd5b611526846114c2565b9250611534602085016114c2565b9150604084013590509250925092565b6000806040838503121561155757600080fd5b50508035926020909101359150565b60008060008060006080868803121561157e57600080fd5b8535945060208601356001600160e81b03198116811461159d57600080fd5b935060408601359250606086013567ffffffffffffffff808211156115c157600080fd5b818801915088601f8301126115d557600080fd5b8135818111156115e457600080fd5b8960208260051b85010111156115f957600080fd5b9699959850939650602001949392505050565b60006020828403121561161e57600080fd5b6114bb826114c2565b60ff60f81b881681526000602060e0602084015261164860e084018a611462565b838103604085015261165a818a611462565b606085018990526001600160a01b038816608086015260a0850187905284810360c08601528551808252602080880193509091019060005b818110156116ae57835183529284019291840191600101611692565b50909c9b505050505050505050505050565b600080600080600080600060e0888a0312156116db57600080fd5b6116e4886114c2565b96506116f2602089016114c2565b95506040880135945060608801359350608088013560ff8116811461171657600080fd5b9699959850939692959460a0840135945060c09093013592915050565b6000806040838503121561174657600080fd5b61174f836114c2565b915061175d602084016114c2565b90509250929050565b600181811c9082168061177a57607f821691505b60208210810361179a57634e487b7160e01b600052602260045260246000fd5b50919050565b6000602082840312156117b257600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b8082028115828204841417610572576105726117b9565b60008261180357634e487b7160e01b600052601260045260246000fd5b500490565b634e487b7160e01b600052603260045260246000fd5b81810381811115610572576105726117b9565b6001600160e81b03198416815260208082018490526060604083018190528351908301819052600091848101916080850190845b8181101561188157845183529383019391830191600101611865565b509098975050505050505050565b80820180821115610572576105726117b9565b634e487b7160e01b600052602160045260246000fdfea264697066735822122026b13528f98fd3f9eb65e3eed64c3172a165963c41b21bb68ffcd16c6dbd950764736f6c63430008170033" as const;

export const USDTABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}] as const;
