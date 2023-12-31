import {ethers, getNamedAccounts} from 'hardhat'
import {ResiToken} from '../typechain-types'

interface IDeployMockERC20 {
  name?: string
  symbol?: string
}

export const deployMockERC20 = async ({name = 'MOCKERC20', symbol = 'MERC20'}: IDeployMockERC20) => {
  const MockERC20Factory = await ethers.getContractFactory('MockERC20')

  const MockERC20Token = await MockERC20Factory.deploy(name, symbol, ethers.parseEther('50'))

  return MockERC20Token
}

export const addBuilder = async (user: string) => {
  const {treasury} = await getNamedAccounts()
  const treasurySigner = await ethers.getSigner(treasury)
  const ResiToken: ResiToken = await ethers.getContract('ResiToken')
  await ResiToken.connect(treasurySigner).addBuilder(user)
}
