import {task} from 'hardhat/config'
import chalk from 'chalk'
import {ResiToken} from '../typechain-types'

export const tasks = () => {
  task('set-value-token', 'Set value token')
    .addParam('token', 'Token address')
    .setAction(async ({token}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).setValueToken(token)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('add-builder', 'Add builder')
    .addParam('builder', 'Builder address')
    .setAction(async ({builder}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).addBuilder(builder)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('remove-builder', 'Remove builder')
    .addParam('builder', 'Builder address')
    .setAction(async ({builder}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).removeBuilder(builder)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('award', 'Award builder')
    .addParam('builder', 'Builder address')
    .addParam('amount', 'Amount to reward')
    .addParam('serie id', 'Serie ID')
    .setAction(async ({builder, amount, serieId}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).award(builder, amount, serieId)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  // eslint-disable-next-line no-empty-pattern
  task('get-version', 'Get contract version').setAction(async ({}, {ethers}) => {
    const ResiToken: ResiToken = await ethers.getContract('ResiToken')
    const response = await ResiToken.version()

    console.log(chalk.green('---- CONTRACT VERSION ----'))
    console.log(response.toString())
  })
}
