import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {verifyContract} from '../scripts/verifyContract'

const version = 'v1.0.0'
const ContractName = 'ResiVaultFactory'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network} = hre
  const {deploy} = deployments
  const {deployer, treasury} = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const ResiToken = await deployments.get('ResiToken')

  const FactoryResult = await deploy(ContractName, {
    args: [treasury, ResiToken.address],
    contract: ContractName,
    from: deployer,
    waitConfirmations: network.live ? 5 : 0,
    skipIfAlreadyDeployed: false
  })

  const resiVaultFactoryAddress = FactoryResult.address

  printDeploySuccessful(ContractName, resiVaultFactoryAddress)

  await verifyContract(network, ContractName)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, ContractName, version]
func.dependencies = ['ResiToken']
func.id = id
