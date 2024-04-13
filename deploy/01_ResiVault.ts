import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {verifyContract} from '../scripts/verifyContract'

const version = 'v1.0.0'
const ContractName = 'ResiVault'

const SERIE_ID = process.env.SERIE_ID ? process.env.SERIE_ID : 1

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network} = hre
  const {deploy} = deployments
  const {deployer, treasury, token} = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const ResiToken = await deployments.get('ResiToken')

  const ResiVaultResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [treasury, ResiToken.address, token, SERIE_ID]
        }
      }
    },
    waitConfirmations: network.live ? 5 : 0,
    skipIfAlreadyDeployed: false
  })

  const resiTokenAddress = ResiVaultResult.address

  printDeploySuccessful(ContractName, resiTokenAddress)

  await verifyContract(network, ContractName)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, ContractName, version]
func.dependencies = ['ResiToken']
func.id = id
