/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {ethers} from 'hardhat'
import {Contract} from 'ethers'

const ERC20Abi = ['function balanceOf(address owner) view returns (uint256)']

export const advanceBlock = () => {
  return ethers.provider.send('evm_mine', [])
}
export const getBlockTimestamp = async () => {
  const block = await ethers.provider.getBlock('latest')
  return block?.timestamp
}

export const getLatestBlock = async () => {
  const block = await ethers.provider.getBlock('latest')
  return block?.number
}

export const advanceTime = async (time: unknown) => {
  await ethers.provider.send('evm_increaseTime', [time])
}

export const advanceBlockTo = async (blockNumber: unknown) => {
  for (let i = await ethers.provider.getBlockNumber(); i < (blockNumber as number); i++) {
    await advanceBlock()
  }
}

export const getERC20 = async (address: string): Promise<Contract> => {
  const ERC20Contract = new ethers.Contract(address, ERC20Abi)
  return ERC20Contract
}

export const getBytes32String = (text: string): string => {
  return ethers.encodeBytes32String(text)
}

export const ethersToWei = (value: string): string => {
  return ethers.parseEther(value).toString()
}
