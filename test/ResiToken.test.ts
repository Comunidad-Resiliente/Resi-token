import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken} from '../typechain-types'
import {DEFAULT_ADMIN_ROLE, BUILDER_ROLE} from './constants'
import {deployMockERC20} from './utils'

describe('Bridge Registry', () => {
  let deployer: Signer
  let treasury: Signer
  let invalidSigner: Signer
  let user: Signer
  let ResiToken: ResiToken
  let MockToken: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    treasury = await ethers.getSigner(accounts.treasury)
    invalidSigner = signers[18]
    user = signers[17]
  })

  beforeEach(async () => {
    const {ResiTokenContract, MockTokenContract} = await resiMainFixture()
    ResiToken = ResiTokenContract
    MockToken = MockTokenContract
  })

  it('Correct initialization', async () => {
    // GIVEN
    const name = 'RESI-TOKEN'
    const symbol = 'RESI'
    const decimals = 18
    // WHEN
    const version: string = await ResiToken.version()

    const amountOfAdmins = await ResiToken.getRoleMemberCount(DEFAULT_ADMIN_ROLE)
    const amountOfBuilders = await ResiToken.getRoleMemberCount(BUILDER_ROLE)
    const adminRole = await ResiToken.getRoleAdmin(DEFAULT_ADMIN_ROLE)
    const deployerIsAdmin = await ResiToken.hasRole(DEFAULT_ADMIN_ROLE, await deployer.getAddress())
    const treasuryIsAdmin = await ResiToken.hasRole(DEFAULT_ADMIN_ROLE, await treasury.getAddress())
    const token = await ResiToken.STABLE_TOKEN()
    const tokenName = await ResiToken.name()
    const tokenSymbol = await ResiToken.symbol()
    const tokenDecimals = await ResiToken.decimals()

    // THEN
    expect(version).to.be.equal('1.0.0')

    expect(amountOfAdmins).to.be.equal(1)
    expect(amountOfBuilders).to.be.equal(0)
    expect(adminRole).to.be.equal(DEFAULT_ADMIN_ROLE)
    // eslint-disable-next-line no-unused-expressions
    expect(deployerIsAdmin).to.be.false
    // eslint-disable-next-line no-unused-expressions
    expect(treasuryIsAdmin).to.be.true
    expect(await MockToken.getAddress()).to.be.equal(token)
    expect(tokenName).to.be.equal(name)
    expect(tokenSymbol).to.be.equal(symbol)
    expect(tokenDecimals).to.be.equal(decimals)
  })

  it('Should allow to set value token', async () => {
    // GIVEN
    const currentToken = await ResiToken.STABLE_TOKEN()
    const newToken = await deployMockERC20({name: 'NEW-TOKEN', symbol: 'NTOKEN'})
    // WHEN
    await expect(ResiToken.connect(treasury).setValueToken(await newToken.getAddress()))
      .to.emit(ResiToken, 'ValueTokenUpdated')
      .withArgs(currentToken, await newToken.getAddress())
    const expectedNewToken = await ResiToken.STABLE_TOKEN()
    // THEN
    expect(currentToken).to.be.equal(await MockToken.getAddress())
    expect(await newToken.getAddress()).to.be.equal(expectedNewToken)
  })

  it('Should not allow to set value token if invalid role', async () => {
    // WHEN
    try {
      await ResiToken.connect(invalidSigner).setValueToken(await MockToken.getAddress())
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('AccessControlUnauthorizedAccount')
    }
  })

  it('Should not allow to set value token if invalid address', async () => {
    // GIVEN
    const invalidToken = ethers.ZeroAddress
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).setValueToken(invalidToken))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(invalidToken)
  })

  it('Should not allow to add builder if invalid role', async () => {
    // WHEN
    try {
      await ResiToken.connect(invalidSigner).addBuilder(await MockToken.getAddress())
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('AccessControlUnauthorizedAccount')
    }
  })

  it('Should not allow builder if invalid address', async () => {
    // GIVEN
    const invalidBuilder = ethers.ZeroAddress
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).addBuilder(invalidBuilder))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(invalidBuilder)
  })

  it('Should allow to add builder', async () => {
    // GIVEN
    const newBuilder = await user.getAddress()
    // WHEN
    await expect(ResiToken.connect(treasury).addBuilder(newBuilder)).to.emit(ResiToken, 'BuilderAdded').withArgs(user)
    const isRegisteredBuilder = await ResiToken.isBuilder(newBuilder)
    // THEN
    // eslint-disable-next-line no-unused-expressions
    expect(isRegisteredBuilder).to.be.true
  })

  it('Should not allow to add builder if address is already builder', async () => {
    // GIVEN
    const builder = await user.getAddress()
    await ResiToken.connect(treasury).addBuilder(builder)
    // WHEN // THEN
    await expect(ResiToken.connect(treasury).addBuilder(builder))
      .to.be.revertedWithCustomError(ResiToken, 'AlreadyBuilder')
      .withArgs(builder)
  })

  it('Should allow to add builders in batch', async () => {
    // GIVEN
    const builders = [await user.getAddress(), await deployer.getAddress()]
    // WHEN
    await ResiToken.connect(treasury).addBuildersBatch(builders)
    const userIsBuilder = await ResiToken.isBuilder(await user.getAddress())
    const deployerIsBUilder = await ResiToken.isBuilder(await deployer.getAddress())
    // THEN
    // eslint-disable-next-line no-unused-expressions
    expect(userIsBuilder).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(deployerIsBUilder).to.be.true
  })

  it('Should not allow to add builders in batch if invalid role', async () => {
    // WHEN
    try {
      await ResiToken.connect(invalidSigner).addBuilder(await MockToken.getAddress())
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('AccessControlUnauthorizedAccount')
    }
  })

  it('Should not allow to add builders in batch if there is any invalid address', async () => {
    // GIVEN
    const builders = [await user.getAddress(), ethers.ZeroAddress]
    // WHEN
    await expect(ResiToken.connect(treasury).addBuildersBatch(builders))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(ethers.ZeroAddress)
    const userIsBuilder = await ResiToken.isBuilder(await user.getAddress())
    const deployerIsBUilder = await ResiToken.isBuilder(await deployer.getAddress())
    // THEN
    // eslint-disable-next-line no-unused-expressions
    expect(userIsBuilder).to.be.false
    // eslint-disable-next-line no-unused-expressions
    expect(deployerIsBUilder).to.be.false
  })

  it('Should not allow to add builders in batch if there is an already builder address', async () => {
    // GIVEN
    await ResiToken.connect(treasury).addBuilder(await user.getAddress())
    const builders = [await user.getAddress(), await deployer.getAddress()]
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).addBuildersBatch(builders))
      .to.be.revertedWithCustomError(ResiToken, 'AlreadyBuilder')
      .withArgs(await user.getAddress())
  })

  it('Should allow to remove builder', async () => {
    // GIVEN
    const builder = await user.getAddress()
    const userIsBuilderInitial = await ResiToken.isBuilder(builder)
    await ResiToken.connect(treasury).addBuilder(builder)
    const userIsBuilderMiddle = await ResiToken.isBuilder(builder)
    // WHEN
    await expect(ResiToken.connect(treasury).removeBuilder(builder))
      .to.emit(ResiToken, 'BuilderRemoved')
      .withArgs(builder)
    const userIsBuilderFinal = await ResiToken.isBuilder(builder)
    // THEN
    // eslint-disable-next-line no-unused-expressions
    expect(userIsBuilderInitial).to.be.false
    // eslint-disable-next-line no-unused-expressions
    expect(userIsBuilderMiddle).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(userIsBuilderFinal).to.be.false
  })

  it('Should not allow to remove builder if invalid role', async () => {
    // WHEN
    try {
      await ResiToken.connect(invalidSigner).removeBuilder(await MockToken.getAddress())
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('AccessControlUnauthorizedAccount')
    }
  })

  it('Should not allow to remove builder if invalid address', async () => {
    // GIVEN
    const invalidBuilder = ethers.ZeroAddress
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).removeBuilder(invalidBuilder))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(invalidBuilder)
  })

  it('Should not allow to remove builder if not builder', async () => {
    // GIVEN
    const invalidBuilder = await user.getAddress()
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).removeBuilder(invalidBuilder))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidBuilder')
      .withArgs(invalidBuilder)
  })

  it('Should not allow to award if invalid role', async () => {
    // WHEN
    try {
      await ResiToken.connect(invalidSigner).award(await MockToken.getAddress(), '10', 1)
    } catch (error: unknown) {
      // THEN
      const err = error.message
      expect(err).to.include('AccessControlUnauthorizedAccount')
    }
  })

  it('Should not allow to award user if serie id is zero', async () => {
    // GIVEN
    const serieId = 0
    const userToAward = await user.getAddress()
    const amount = '10'
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).award(userToAward, amount, serieId))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidSerie')
      .withArgs(serieId)
  })

  it('Should not allow to award user if invalid address', async () => {
    // GIVEN
    const serieId = 1
    const userToAward = ethers.ZeroAddress
    const amount = '10'
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).award(userToAward, amount, serieId))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(userToAward)
  })

  it('Should not allowt to award user if invalid amount', async () => {
    // GIVEN
    const serieId = 1
    const userToAward = await user.getAddress()
    const amount = 0
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).award(userToAward, amount, serieId))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAmount')
      .withArgs(amount)
  })

  it('Should not allowt to award user if user is not builder', async () => {
    // GIVEN
    const serieId = 1
    const userToAward = await user.getAddress()
    const amount = 20
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).award(userToAward, amount, serieId))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidBuilder')
      .withArgs(userToAward)
  })

  it('Should not allow to execute transfer', async () => {
    await expect(ResiToken.connect(user).transfer(await deployer.getAddress(), '10'))
      .to.be.revertedWithCustomError(ResiToken, 'TransferForbidden')
      .withArgs('RESIToken: NO TRANSFER ALLOWED')
  })

  it('Should not allow to execute transfer from', async () => {
    await expect(ResiToken.connect(user).transferFrom(await deployer.getAddress(), await deployer.getAddress(), '10'))
      .to.be.revertedWithCustomError(ResiToken, 'TransferFromForbidden')
      .withArgs('RESIToken: NO TRANSFER FROM ALLOWED')
  })
})
