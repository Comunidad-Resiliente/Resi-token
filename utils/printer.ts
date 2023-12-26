import chalk from 'chalk'

export const printSuccess = (text: string): void => {
  console.log(chalk.green(text))
}

export const printError = (text: string): void => {
  console.log(chalk.red(text))
}

export const printWarning = (text: string): void => {
  console.log(chalk.magenta(text))
}

export const printInfo = (text: string): void => {
  console.log(chalk.yellow(text))
}

export const printDeploySuccessful = (contractName: string, address: string) => {
  printInfo('Contract Deployment Complete!')
  printSuccess(` ContractName ${contractName}`)
  printSuccess(` ContractAddress - ${address}`)
}
