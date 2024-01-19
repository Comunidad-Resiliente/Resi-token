import chalk from 'chalk'
import {task} from 'hardhat/config'

export const tasks = () => {
  task('upgrade', 'Upgrade a Proxy to a new impementation')
    .addParam('contract', 'Contract name')
    .addParam('contractVersion', 'Version number contract')
    .addOptionalParam('data', 'Method data to call on new implementation', undefined, types.string)
    .setAction(async ({contract, contractVersion}, {ethers}) => {
      const [admin] = await ethers.getSigners()

      // Get the contracts
      const ProxyAdmin = await ethers.getContract('DefaultProxyAdmin')
      const transparentProxy = await (await ethers.getContract(`${contract}_Proxy`, admin)).getAddress()

      // GET PROXY IMPLEMENTATION OF LAST CONTRACT VERSION
      const implementation = await ProxyAdmin.getProxyImplementation(transparentProxy)

      const ProxyContract = await ethers.getContractAt(`${contract}`, transparentProxy)
      const currentContractVersion = await ProxyContract.version()

      console.log(chalk.yellow(`Current Implementation (${implementation}) version is: ${currentContractVersion}`))

      const NewContract = await ethers.getContract(`${contract}V${contractVersion}`)

      console.log(chalk.yellow(`Upgrading contract....`))

      const tx = await ProxyAdmin.upgrade(transparentProxy, await NewContract.getAddress())

      const receipt = await tx.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }

      // NEW CONTRACT VERSION
      const newImplementation = await ProxyAdmin.getProxyImplementation(transparentProxy)
      const NewProxyContract = await ethers.getContractAt(`${contract}V${contractVersion}`, transparentProxy)

      const newContractVersion = await NewProxyContract.version()

      console.log(chalk.green(`Implementation (${newImplementation}) version is: ${newContractVersion}`))
    })
}
