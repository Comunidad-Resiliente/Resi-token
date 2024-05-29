import {task} from 'hardhat/config'
import chalk from 'chalk'
import {ResiToken} from '../typechain-types'

export const tasks = () => {
  task('serie-supply', 'Get serie supply minted')
    .addParam('serieId', 'Serie ID')
    .setAction(async ({serieId}, {ethers}) => {
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const res = await ResiToken.serieSupplies(serieId)

      console.log(chalk.green('---- SERIE SUPPLY MINTED----'))
      console.log(res.toString())
    })

  task('user-serie-balance', 'Get user serie balance')
    .addParam('serieId', 'Serie ID')
    .addParam('user', 'user address')
    .setAction(async ({serieId, user}, {ethers}) => {
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const res = await ResiToken.userSerieBalance(serieId, user)

      console.log(chalk.green('----USER SERIE SUPPLY ----'))
      console.log(res.toString())
    })

  // eslint-disable-next-line no-empty-pattern
  task('get-version', 'Get contract version').setAction(async ({}, {ethers}) => {
    const ResiToken: ResiToken = await ethers.getContract('ResiToken')
    const response = await ResiToken.version()

    console.log(chalk.green('---- CONTRACT VERSION ----'))
    console.log(response.toString())
  })

  task('get-serie-vault', 'Get Serie Vault contract')
    .addParam('serieId', 'Serie ID')
    .setAction(async ({serieId}, {ethers}) => {
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.serieVaults(serieId)
      console.log('SERIE VAULT')
      console.log(response)
    })

  // eslint-disable-next-line no-empty-pattern
  task('get-treasury', 'Get treasury').setAction(async ({}, {ethers}) => {
    const ResiToken: ResiToken = await ethers.getContract('ResiToken')
    const response = await ResiToken.TREASURY()
    console.log('------ TREASURY ------')
    console.log(response)
  })
}
