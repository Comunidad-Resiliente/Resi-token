import {ethers, deployments, getNamedAccounts} from 'hardhat'
import {ResiToken, ResiVault} from '../typechain-types'
import {deployMockERC20} from './utils'

export const resiMainFixture = deployments.createFixture(async () => {
  await deployments.fixture(['v1.0.0'])

  const {deployer, treasury} = await getNamedAccounts()
  const treasurySigner = await ethers.getSigner(treasury)

  const ResiTokenContract: ResiToken = await ethers.getContract<ResiToken>('ResiToken', deployer)
  const ResiVaultContract: ResiVault = await ethers.getContract<ResiVault>('ResiVault', deployer)
  const MockTokenContract = await deployMockERC20({name: 'MOCKTOKEN', symbol: 'MERC20'})

  // Register mock token as value token
  await ResiVaultContract.connect(treasurySigner).setValueToken(await MockTokenContract.getAddress())

  // Mint mock tokens to resi token
  await MockTokenContract.mintTo(await ResiVaultContract.getAddress(), ethers.parseEther('5'))

  return {
    ResiTokenContract,
    ResiVaultContract,
    MockTokenContract
  }
})

export const resiIntegrationFixture = deployments.createFixture(async () => {
  await deployments.fixture(['v1.0.0'])

  const {deployer, treasury} = await getNamedAccounts()
  const treasurySigner = await ethers.getSigner(treasury)

  const ResiTokenContract: ResiToken = await ethers.getContract<ResiToken>('ResiToken', deployer)
  const ResiVaultContract: ResiVault = await ethers.getContract<ResiVault>('ResiVault', deployer)
  const MockTokenContract = await deployMockERC20({name: 'MOCKTOKEN', symbol: 'MERC20'})

  // Register mock token as value token
  await ResiVaultContract.connect(treasurySigner).setValueToken(await MockTokenContract.getAddress())

  // Mint mock tokens to resi token
  await MockTokenContract.mintTo(await ResiVaultContract.getAddress(), 5 * 10 ** 6)

  // Enable exits
  await ResiTokenContract.connect(treasurySigner).enableExits()

  return {
    ResiTokenContract,
    ResiVaultContract,
    MockTokenContract
  }
})
