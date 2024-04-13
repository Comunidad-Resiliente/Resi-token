import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiIntegrationFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken, ResiVault} from '../typechain-types'

describe('Resi token integration tests', () => {
  let treasury: Signer
  let userOne: Signer, userTwo: Signer, userThree: Signer, userFour: Signer
  let ResiToken: ResiToken
  let ResiVault: ResiVault
  let MockToken: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    treasury = await ethers.getSigner(accounts.treasury)
    userOne = signers[17]
    userTwo = signers[16]
    userThree = signers[15]
    userFour = signers[14]
  })

  beforeEach(async () => {
    const {ResiTokenContract, ResiVaultContract, MockTokenContract} = await resiIntegrationFixture()
    ResiToken = ResiTokenContract
    ResiVault = ResiVaultContract
    MockToken = MockTokenContract
  })

  it('Scenario one: Four users one serie', async () => {
    // GIVEN
    // 1. Add builders batch

    await ResiToken.connect(treasury).addBuildersBatch([
      await userOne.getAddress(),
      await userTwo.getAddress(),
      await userThree.getAddress(),
      await userFour.getAddress()
    ])

    await ResiToken.connect(treasury).setSerieVault(await ResiVault.getAddress(), 1)

    // 2. Award them
    await ResiToken.connect(treasury).awardBatch(
      [
        await userOne.getAddress(),
        await userTwo.getAddress(),
        await userThree.getAddress(),
        await userFour.getAddress()
      ],
      [3, 1, 2, 4],
      1
    )

    // RESI TOKEN BALANCES
    const userOneResiBalance = await ResiToken.balanceOf(await userOne.getAddress())
    const userTwoResiBalance = await ResiToken.balanceOf(await userTwo.getAddress())
    const userThreeResiBalance = await ResiToken.balanceOf(await userThree.getAddress())
    const userFourResiBalance = await ResiToken.balanceOf(await userFour.getAddress())

    // STABLE TOKEN BALANCES
    const userOneMockTokenBalance = await MockToken.balanceOf(await userOne.getAddress())
    const userTwoMockTokenBalance = await MockToken.balanceOf(await userTwo.getAddress())
    const userThreeMockTokenBalance = await MockToken.balanceOf(await userThree.getAddress())
    const userFourMockTokenBalance = await MockToken.balanceOf(await userFour.getAddress())

    const stableTokenInitialSupply = await ResiVault.getStableTokenBalance()

    // WHEN
    // 3. Performs exits

    await ResiToken.connect(userFour).exit(1)
    const stableTokenPartialSupplyOne = await ResiVault.getStableTokenBalance()
    /**
     * 4 * 5*10**6 / 10 = 2x10^&6
     * Supply remaining = 5x10^6 - 2x10^6 = 3x10^6
     */
    await ResiToken.connect(userOne).exit(1)
    const stableTokenPartialSupplyTwo = await ResiVault.getStableTokenBalance()
    /**
     * 3 * 3x10^6 / 10 = 900000
     * Supply remaining = 3x10^6 - 900000 = 2100000
     */
    await ResiToken.connect(userTwo).exit(1)
    const stableTokenPartialSupplyThree = await ResiVault.getStableTokenBalance()
    /**
     * 1 * 2100000 / 10 = 210000
     * Supply remaining =  2100000 - 210000 = 1890000
     */
    await ResiToken.connect(userThree).exit(1)
    const stableTokenPartialSupplyFour = await ResiVault.getStableTokenBalance()
    /**
     * 2 * 1890000 / 10 = 378000
     * Supply remaining = 1890000 - 378000 =  1512000
     */

    // Pause contract and withdrawn funds
    await ResiToken.connect(treasury).pause()
    const treasuryStableTokenBalance = await MockToken.balanceOf(await treasury.getAddress())
    await ResiToken.connect(treasury).withdrawSerieVaultToken(1)

    const stableTokenFinalSupply = await ResiVault.getStableTokenBalance()
    const treasuryFinalTokenBalance = await MockToken.balanceOf(await treasury.getAddress())

    const userOneResiFinalBalance = await ResiToken.balanceOf(await userOne.getAddress())
    const userTwoResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())
    const userThreeResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())
    const userFourResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())

    // THEN
    expect(stableTokenInitialSupply).to.be.equal(BigInt('5000000'))
    expect(stableTokenPartialSupplyOne).to.be.equal(BigInt('3000000'))
    expect(stableTokenPartialSupplyTwo).to.be.equal(BigInt('2100000'))
    expect(stableTokenPartialSupplyThree).to.be.equal(BigInt('1890000'))
    expect(stableTokenPartialSupplyFour).to.be.equal(BigInt('1512000'))

    expect(userOneResiBalance).to.be.equal(3)
    expect(userTwoResiBalance).to.be.equal(1)
    expect(userThreeResiBalance).to.be.equal(2)
    expect(userFourResiBalance).to.be.equal(4)

    expect(userOneMockTokenBalance).to.be.equal(0)
    expect(userTwoMockTokenBalance).to.be.equal(0)
    expect(userThreeMockTokenBalance).to.be.equal(0)
    expect(userFourMockTokenBalance).to.be.equal(0)

    expect(userOneResiFinalBalance).to.be.equal(0)
    expect(userTwoResiFinalBalance).to.be.equal(0)
    expect(userThreeResiFinalBalance).to.be.equal(0)
    expect(userFourResiFinalBalance).to.be.equal(0)

    expect(treasuryFinalTokenBalance).to.be.equal(BigInt('1512000'))
    expect(treasuryStableTokenBalance).to.be.equal(0)
    expect(stableTokenFinalSupply).to.be.equal(0)
  })
})
