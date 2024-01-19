import {ethers, run} from 'hardhat'
import {printInfo, printError} from '../utils'
import {Contract} from 'ethers'
import {Network} from 'hardhat/types'
import chalk from 'chalk'

export type TaskArgs = {
  address: string
  constructorArguments?: string[]
}

const NETWORKS_NOT_SUPPORTED: string[] = ['vchain_testnet']

export const verifyContract = async (
  network: Network,
  contractName: string,
  constructorArguments?: string[],
  upgradeable = true
) => {
  let ImplementationContract: Contract

  if (network.live && !NETWORKS_NOT_SUPPORTED.includes(network.name)) {
    try {
      if (!upgradeable) {
        ImplementationContract = await ethers.getContract(`${contractName}`)
      } else {
        console.log('DONDE ESTA ENTRANDO??')
        ImplementationContract = await ethers.getContract(`${contractName}_Implementation`)
      }
    } catch (err: unknown) {
      console.log(chalk.red('Contract not found'))
      throw err
    }

    const taskArgs: TaskArgs = {
      address: await ImplementationContract.getAddress()
    }
    if (constructorArguments) {
      taskArgs.constructorArguments = constructorArguments
    }

    try {
      printInfo(`Starting Verification of ${contractName} ${await ImplementationContract.getAddress()}`)
      await run('verify:verify', taskArgs)
    } catch (err: unknown) {
      if (err.message.includes('Already Verified')) {
        printError('Already Verified')
        return
      }
      throw err
    }
  }
}
