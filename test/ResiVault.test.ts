import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken, ResiVault} from '../typechain-types'
import {deployMockERC20} from './utils'

describe('Resi Vault', () => {
  let treasury: Signer
  let invalidSigner: Signer
  let user: Signer
  let ResiToken: ResiToken
  let ResiVault: ResiVault
  let MockToken: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    treasury = await ethers.getSigner(accounts.treasury)
    invalidSigner = signers[18]
    user = signers[17]
  })

  beforeEach(async () => {
    const {ResiTokenContract, ResiVaultContract, MockTokenContract} = await resiMainFixture()
    ResiToken = ResiTokenContract
    ResiVault = ResiVaultContract
    MockToken = MockTokenContract
  })

  it('Correct initialization', async () => {
    // GIVEN
    const expectedVersion = '1.0.0'
    const expectedResiToken = await ResiToken.getAddress()
    const expectedStableToken = await MockToken.getAddress()
    const expectedSerieId = 1
    const expectedOwner = treasury
    // WHEN
    const version = await ResiVault.version()
    const resiToken = await ResiVault.RESI_TOKEN()
    const stableToken = await ResiVault.STABLE_TOKEN()
    const serieId = await ResiVault.SERIE_ID()
    const owner = await ResiVault.owner()
    // THEN
    expect(expectedVersion).to.be.equal(version)
    expect(expectedSerieId).to.be.equal(serieId)
    expect(expectedResiToken).to.be.equal(resiToken)
    expect(expectedStableToken).to.be.equal(stableToken)
    expect(expectedOwner).to.be.equal(owner)
  })

  it('Get exit quote should return zero if serie supply is zero', async () => {
    // GIVEN
    const serieSupply = 0
    // WHEN
    const quote = await ResiVault.getExitQuote(10, serieSupply)
    // THEN
    expect(quote).to.be.equal(0)
  })

  it('Get exit quote', async () => {
    // GIVEN
    const userResiBalance = 10
    const serieSupply = 1000
    // WHEN
    const quote = await ResiVault.getExitQuote(userResiBalance, serieSupply)
    // THEN
    expect(quote).to.be.equal('50000000000000000')
  })

  it('Get stable token balance', async () => {
    // GIVEN
    const stableTokenBalance = ethers.parseEther('5')
    // WHEN
    const balance = await ResiVault.getStableTokenBalance()
    // THEN
    expect(stableTokenBalance).to.be.equal(balance)
  })

  it('Should allow to set value token', async () => {
    // GIVEN
    const currentToken = await ResiVault.STABLE_TOKEN()
    const newToken = await deployMockERC20({name: 'NEW-TOKEN', symbol: 'NTOKEN'})
    // WHEN
    await expect(ResiVault.connect(treasury).setValueToken(await newToken.getAddress()))
      .to.emit(ResiVault, 'ValueTokenUpdated')
      .withArgs(currentToken, await newToken.getAddress())
    const expectedNewToken = await ResiVault.STABLE_TOKEN()
    // THEN
    expect(currentToken).to.be.equal(await MockToken.getAddress())
    expect(await newToken.getAddress()).to.be.equal(expectedNewToken)
  })

  it('Should not allow to set value token if invalid role', async () => {
    // WHEN
    try {
      await ResiVault.connect(invalidSigner).setValueToken(await MockToken.getAddress())
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('OwnableUnauthorizedAccount')
    }
  })

  it('Should not allow to set value token if invalid address', async () => {
    // GIVEN
    const invalidToken = ethers.ZeroAddress
    // WHEN //THEN
    await expect(ResiVault.connect(treasury).setValueToken(invalidToken))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(invalidToken)
  })

  it('Should not allow to release if caller is not resi token', async () => {
    // WHEN // THEN
    await expect(ResiVault.release(await user.getAddress(), 10, 100)).to.be.revertedWith('RESIVault: ONLY RESI TOKEN')
  })

  it('Should not allow to withdraw value token if caller is not resi token', async () => {
    // WHEN // THEN
    await expect(ResiVault.withdrawToTreasury(await user.getAddress())).to.be.revertedWith('RESIVault: ONLY RESI TOKEN')
  })
})
