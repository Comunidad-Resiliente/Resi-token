import {task} from 'hardhat/config'
import chalk from 'chalk'
import {ResiToken} from '../typechain-types'

export const tasks = () => {
  task('serie-supplies', 'Get serie supply emitted')
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
}
