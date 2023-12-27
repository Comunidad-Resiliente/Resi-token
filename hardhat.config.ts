import {HardhatUserConfig} from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'

import networks from './hardhat.networks'
import namedAccounts from './hardhat.accounts'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks,
  namedAccounts,
  // PLUGINS CONFIGURATIONS
  abiExporter: {
    path: './abis',
    runOnCompile: false,
    only: [':ResiToken$']
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 30,
    enabled: !!process.env.REPORT_GAS
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY ? process.env.POLYGONSCAN_API_KEY : '',
      polygon: process.env.POLYGONSCAN_API_KEY ? process.env.POLYGONSCAN_API_KEY : '',
      sepolia: process.env.SEPOLIASCAN_API_KEY ? process.env.SEPOLIASCAN_API_KEY : '',
      mainnet: process.env.ETHERSCAN_API_KEY ? process.env.ETHERSCAN_API_KEY : ''
    }
  }
}

export default config
