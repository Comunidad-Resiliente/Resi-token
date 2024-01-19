const networks = {
  localhost: {
    chainId: 31337,
    url: 'http://127.0.0.1:8545',
    allowUnlimitedContractSize: true,
    timeout: 1000 * 60
  },
  hardhat: {
    live: false,
    allowUnlimitedContractSize: true,
    saveDeployments: true,
    tags: ['test', 'local']
  },
  polygon: {
    chainId: 137,
    url: process.env.ALCHEMY_KEY
      ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
      : 'https://speedy-nodes-nyc.moralis.io/237feb2eade8c576d06ac0ae/polygon/mainnet',
    accounts: {mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''},
    live: true
  },
  mumbai: {
    live: true,
    chainId: 80001,
    url: process.env.ALCHMEMY_MUMBAI_KEY
      ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
      : 'https://rpc-mumbai.maticvigil.com',
    accounts: {
      mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''
    },
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['testnet', 'mumbai']
  },
  sepolia: {
    live: true,
    chainId: 11155111,
    url: process.env.SEPOLIA_ALCHEMY_KEY
      ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`
      : '',
    accounts: {
      mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''
    },
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['testnet', 'sepolia']
  }
}

export default networks
