import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiIntegrationFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken} from '../typechain-types'

describe('Bridge Registry', () => {
  let treasury: Signer
  let userOne: Signer, userTwo: Signer, userThree: Signer, userFour: Signer
  let ResiToken: ResiToken
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
    const {ResiTokenContract, MockTokenContract} = await resiIntegrationFixture()
    ResiToken = ResiTokenContract
    MockToken = MockTokenContract
  })

  it('Scenario one: two series and four users', async () => {
    // GIVEN
    // 1. Add builders batch

    await ResiToken.connect(treasury).addBuildersBatch([
      await userOne.getAddress(),
      await userTwo.getAddress(),
      await userThree.getAddress(),
      await userFour.getAddress()
    ])

    // 2. Award them
    await ResiToken.connect(treasury).awardBatch([await userOne.getAddress(), await userTwo.getAddress()], [3, 1], 1)
    await ResiToken.connect(treasury).awardBatch([await userThree.getAddress(), await userFour.getAddress()], [2, 4], 2)

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

    const stableTokenInitialSupply = await MockToken.balanceOf(await ResiToken.getAddress())

    // WHEN
    // 3. Performs exits

    await ResiToken.connect(userFour).exit(2)
    const stableTokenPartialSupplyOne = await MockToken.balanceOf(await ResiToken.getAddress())
    await ResiToken.connect(userOne).exit(1)
    const stableTokenPartialSupplyTwo = await MockToken.balanceOf(await ResiToken.getAddress())
    await ResiToken.connect(userTwo).exit(1)
    const stableTokenPartialSupplyThree = await MockToken.balanceOf(await ResiToken.getAddress())
    await ResiToken.connect(userThree).exit(2)
    const stableTokenPartialSupplyFour = await MockToken.balanceOf(await ResiToken.getAddress())

    // Pause contract and withdrawn funds
    await ResiToken.connect(treasury).pause()
    const treasuryStableTokenBalance = await MockToken.balanceOf(await treasury.getAddress())
    await ResiToken.connect(treasury).withdrawnValueToken()

    const stableTokenFinalSupply = await MockToken.balanceOf(await ResiToken.getAddress())
    const treasuryFinalTokenBalance = await MockToken.balanceOf(await treasury.getAddress())

    const userOneResiFinalBalance = await ResiToken.balanceOf(await userOne.getAddress())
    const userTwoResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())
    const userThreeResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())
    const userFourResiFinalBalance = await ResiToken.balanceOf(await userTwo.getAddress())

    // THEN
    expect(stableTokenInitialSupply).to.be.equal(BigInt('5000000'))
    expect(stableTokenPartialSupplyOne).to.be.equal(BigInt('1666667'))
    expect(stableTokenPartialSupplyTwo).to.be.equal(BigInt('416667'))
    expect(stableTokenPartialSupplyThree).to.be.equal(BigInt('312501'))
    expect(stableTokenPartialSupplyFour).to.be.equal(BigInt('208334'))

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

    expect(stableTokenFinalSupply).to.be.equal(0)
    expect(treasuryStableTokenBalance).to.be.equal(0)
    expect(treasuryFinalTokenBalance).to.be.equal(BigInt('208334'))
  })
})
