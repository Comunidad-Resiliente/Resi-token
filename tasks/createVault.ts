import {task} from 'hardhat/config'
import chalk from 'chalk'
import {ResiVaultFactory} from '../typechain-types'

export const tasks = () => {
  task('create-vault', 'Create serie vault')
    .addParam('stableToken', 'Stable token address')
    .addParam('serie', 'Serie id')
    .setAction(async ({stableToken, serieId}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiVaultFactory: ResiVaultFactory = await ethers.getContract('ResiVaultFactory')
      const response = await ResiVaultFactory.connect(admin).createVault(stableToken, serieId)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
