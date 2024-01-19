import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {verifyContract} from '../scripts/verifyContract'

const version = 'v1.0.0'
const ContractName = 'ResiToken'
const TOKEN_NAME = process.env.TOKEN_NAME ? process.env.TOKEN_NAME : 'RESI-TOKEN'
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL ? process.env.TOKEN_SYMBOL : 'RESI'
const TOKEN_DECIMALS = process.env.TOKEN_DECIMALS ? process.env.TOKEN_DECIMALS : 18

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network} = hre
  const {deploy} = deployments
  const {deployer, treasury, token} = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const ResiTokenResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, treasury, token, []]
        }
      }
    },
    waitConfirmations: network.live ? 5 : 0,
    skipIfAlreadyDeployed: false
  })

  const resiTokenAddress = ResiTokenResult.address

  printDeploySuccessful(ContractName, resiTokenAddress)

  await verifyContract(network, ContractName)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, ContractName, version]
func.dependencies = ['']
func.id = id
