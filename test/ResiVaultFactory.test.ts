import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken} from '../typechain-types'
import {deployResiVaultFactory} from './utils'

describe('Resi Vault Factory', () => {
  let treasury: Signer
  let invalidSigner: Signer
  let ResiToken: ResiToken
  let MockToken: Contract
  let Factory: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    treasury = await ethers.getSigner(accounts.treasury)
    invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const {ResiTokenContract, MockTokenContract} = await resiMainFixture()
    ResiToken = ResiTokenContract
    MockToken = MockTokenContract
    Factory = await deployResiVaultFactory(await treasury.getAddress(), await ResiToken.getAddress())
  })

  it('Correct initialization', async () => {
    // GIVEN
    const expectedTreasury = await treasury.getAddress()
    const expectedResiToken = await ResiToken.getAddress()
    const vaultsLength = 0
    // WHEN
    const contractOwner = await Factory.owner()
    const resiToken = await Factory.RESI_TOKEN()
    const vaults = await Factory.getVaults()
    // THEN
    expect(expectedTreasury).to.be.equal(contractOwner)
    expect(expectedResiToken).to.be.equal(resiToken)
    expect(vaultsLength).to.be.equal(vaults.length)
  })

  it('Should not allow to create vault if invalid stable token', async () => {
    // GIVEN
    const invalidToken = ethers.ZeroAddress
    // WHEN  //THEN
    await expect(Factory.connect(treasury).createVault(invalidToken, 1)).to.be.revertedWithCustomError(
      Factory,
      'InvalidAddress'
    )
  })

  it('Should not allow to create vault if not trasury', async () => {
    // WHEN
    try {
      await Factory.connect(invalidSigner).createVault(await MockToken.getAddress(), 4)
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('OwnableUnauthorizedAccount')
    }
  })

  it('Should not allow to create vault if invalid serie id', async () => {
    // GIVEN
    const invalidSerie = 0
    // WHEN  //THEN
    await expect(
      Factory.connect(treasury).createVault(await MockToken.getAddress(), invalidSerie)
    ).to.be.revertedWithCustomError(Factory, 'InvalidSerie')
  })

  it('Should allow to create vault', async () => {
    // GIVEN
    const serieId = 2
    const stableToken = await MockToken.getAddress()
    const initialVaults = await Factory.getVaults()
    // WHEN
    await expect(Factory.connect(treasury).createVault(stableToken, serieId)).to.emit(Factory, 'ResiVaultCreated')
    const finalVaults = await Factory.getVaults()
    // THEN
    expect(initialVaults.length).to.be.equal(0)
    expect(finalVaults.length).to.be.equal(1)
  })
})
