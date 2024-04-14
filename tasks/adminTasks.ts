import {task} from 'hardhat/config'
import chalk from 'chalk'
import {ResiToken} from '../typechain-types'

export const tasks = () => {
  task('set-serie-vault', 'Set serie vault')
    .addParam('vault', 'Vault address')
    .addParam('serie', 'Serie id')
    .setAction(async ({vault, serieId}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).setSerieVault(vault, serieId)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('update-serie-vault-status', 'Update serie vault status')
    .addParam('serie', 'Serie id')
    .addParam('status', 'new status')
    .setAction(async ({serie, status}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).updateSerieVaultStatus(serie, status)

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
  task('enable-exits', 'Enable exits').setAction(async ({}, {ethers}) => {
    const [admin] = await ethers.getSigners()
    const ResiToken: ResiToken = await ethers.getContract('ResiToken')
    const response = await ResiToken.connect(admin).enableExits()

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
  task('disable-exits', 'Disable exits').setAction(async ({}, {ethers}) => {
    const [admin] = await ethers.getSigners()
    const ResiToken: ResiToken = await ethers.getContract('ResiToken')
    const response = await ResiToken.connect(admin).disableExits()

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
    .addParam('serieId', 'Serie ID')
    .setAction(async ({builder, amount, serieId}, {ethers}) => {
      const [admin] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).award(builder, ethers.parseEther(amount), serieId)

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
