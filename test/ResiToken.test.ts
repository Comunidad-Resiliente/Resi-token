import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken} from '../typechain-types'
import {DEFAULT_ADMIN_ROLE, BUILDER_ROLE} from './constants'
import {addBuilder, deployMockERC20} from './utils'

describe('Bridge Registry', () => {
  let deployer: Signer
  let treasury: Signer
  let invalidSigner: Signer
  let user: Signer
  let userTwo: Signer
  let ResiToken: ResiToken
  let MockToken: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    treasury = await ethers.getSigner(accounts.treasury)
    invalidSigner = signers[18]
    user = signers[17]
    userTwo = signers[16]
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

  it('Should allow to award user', async () => {
    // GIVEN
    const userToAward = await user.getAddress()
    const serieId = 1
    const amount = ethers.parseEther('0.3')
    await addBuilder(userToAward)
    const initialSerieSupply = await ResiToken.serieSupplies(serieId)
    const initialUserSerieBalance = await ResiToken.userSerieBalance(serieId, userToAward)

    // WHEN
    await expect(ResiToken.connect(treasury).award(userToAward, amount, serieId))
      .to.emit(ResiToken, 'UserAwarded')
      .withArgs(userToAward, amount, serieId)

    const finalserieSupply = await ResiToken.serieSupplies(serieId)
    const finalUSerSerieBalance = await ResiToken.userSerieBalance(serieId, userToAward)
    const userTotalBalance = await ResiToken.balanceOf(userToAward)

    // THEN
    expect(initialSerieSupply).to.be.equal(0)
    expect(initialUserSerieBalance).to.be.equal(0)
    expect(finalserieSupply).to.be.equal(amount)
    expect(userTotalBalance).to.be.equal(finalUSerSerieBalance)
  })

  it('Should allow to award batch', async () => {
    // GIVEN
    const users = [await user.getAddress(), await deployer.getAddress()]
    const amounts = [ethers.parseEther('0.3'), ethers.parseEther('0.2')]
    const serieId = 1
    await addBuilder(await user.getAddress())
    await addBuilder(await deployer.getAddress())
    // WHEN
    await ResiToken.connect(treasury).awardBatch(users, amounts, serieId)

    const userBalance = await ResiToken.balanceOf(await user.getAddress())
    const deployerBalance = await ResiToken.balanceOf(await deployer.getAddress())
    const serieSupply = await ResiToken.serieSupplies(serieId)
    // THEN
    expect(userBalance).to.be.equal(amounts[0])
    expect(deployerBalance).to.be.equal(amounts[1])
    expect(serieSupply).to.be.equal(ethers.parseEther('0.5'))
  })

  it('Should not allow to award batch if users and amount mismatch', async () => {
    // GIVEN
    const users = [await user.getAddress(), await deployer.getAddress()]
    const amounts = [ethers.parseEther('0.3')]
    const serieId = 1
    await addBuilder(await user.getAddress())
    await addBuilder(await deployer.getAddress())
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).awardBatch(users, amounts, serieId)).to.be.revertedWith(
      'RESIToken: users and amounts length mismatch'
    )
  })

  it('Shoud allow to exit', async () => {
    // GIVEN
    const userToAward = await user.getAddress()
    const amount = ethers.parseEther('0.3')
    const serieId = 1
    await addBuilder(userToAward)
    await addBuilder(await userTwo.getAddress())
    await ResiToken.connect(treasury).award(userToAward, amount, serieId)
    await ResiToken.connect(treasury).award(await userTwo.getAddress(), ethers.parseEther('0.5'), serieId)
    await ResiToken.connect(treasury).enableExits()

    const userInitialResiBalance = await ResiToken.balanceOf(await user.getAddress())
    const stableTokenContractBalance = await MockToken.balanceOf(await ResiToken.getAddress())
    const userStableTokenInitialBalance = await MockToken.balanceOf(await user.getAddress())
    const userSerieBalance = await ResiToken.userSerieBalance(serieId, await user.getAddress())

    const quote = (amount * stableTokenContractBalance) / ethers.parseEther('0.8')

    // WHEN
    await expect(ResiToken.connect(user).exit(serieId))
      .to.emit(ResiToken, 'Exit')
      .withArgs(await user.getAddress(), quote, serieId)

    const userFinalResiBalance = await ResiToken.balanceOf(await user.getAddress())
    const userStableTokenFinalBalance = await MockToken.balanceOf(await user.getAddress())
    const stableTokenContractFinalBalance = await MockToken.balanceOf(await ResiToken.getAddress())
    const userSerieFinalBalance = await ResiToken.userSerieBalance(serieId, await user.getAddress())

    const serieSupply = await ResiToken.serieSupplies(serieId)

    // THEN
    expect(userInitialResiBalance).to.be.equal(amount)
    expect(userFinalResiBalance).to.be.equal(0)
    expect(stableTokenContractBalance).to.be.equal(ethers.parseEther('5'))
    expect(userStableTokenInitialBalance).to.be.equal(0)
    expect(userStableTokenFinalBalance).to.be.equal(quote)
    expect(stableTokenContractFinalBalance).to.be.lessThan(stableTokenContractBalance)
    expect(serieSupply).to.be.equal(ethers.parseEther('0.8'))
    expect(userSerieBalance).to.be.equal(amount)
    expect(userSerieFinalBalance).to.be.equal(0)
  })

  it('Should not allow to exit if exits are not enabled', async () => {
    // GIVEN
    const userToAward = await user.getAddress()
    const amount = ethers.parseEther('0.3')
    const serieId = 1
    await addBuilder(userToAward)
    await addBuilder(await userTwo.getAddress())
    await ResiToken.connect(treasury).award(userToAward, amount, serieId)
    await ResiToken.connect(treasury).award(await userTwo.getAddress(), ethers.parseEther('0.5'), serieId)

    // WHEN //THEN
    await expect(ResiToken.connect(user).exit(serieId)).to.be.revertedWith('RESIToken: Exits disabled')
  })

  it('Should not allow to exit if caller is treasury', async () => {
    // GIVEN
    await ResiToken.connect(treasury).enableExits()
    // WHEN //THEN
    await expect(ResiToken.connect(treasury).exit(1))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
      .withArgs(await treasury.getAddress())
  })

  it('Should not allow to exit if user is not builder', async () => {
    // GIVEN
    const notBuilder = await user.getAddress()
    await ResiToken.connect(treasury).enableExits()
    // WHEN // THEN
    await expect(ResiToken.connect(user).exit(0))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidBuilder')
      .withArgs(notBuilder)
  })

  it('Should not allow to exit if serie has not minted supply', async () => {
    // GIVEN
    await ResiToken.connect(treasury).addBuilder(await user.getAddress())
    await ResiToken.connect(treasury).enableExits()
    // WHEN // THEN
    await expect(ResiToken.connect(user).exit(2))
      .to.be.revertedWithCustomError(ResiToken, 'SerieWithNoMintedSupply')
      .withArgs(2)
  })

  it('Should not allow to exit if user has no serie balance', async () => {
    // GIVEN
    await ResiToken.connect(treasury).addBuilder(await user.getAddress())
    await ResiToken.connect(treasury).enableExits()
    await ResiToken.connect(treasury).award(await user.getAddress(), '10', 2)
    await ResiToken.connect(treasury).addBuilder(await deployer.getAddress())
    await ResiToken.connect(treasury).award(await deployer.getAddress(), '10', 1)
    // WHEN // THEN
    await expect(ResiToken.connect(user).exit(1))
      .to.be.revertedWithCustomError(ResiToken, 'InvalidUserSerieBalance')
      .withArgs(0)
  })

  it('Should not allow to exit if contract has not enough balance of stable token', async () => {
    // GIVEN
    await ResiToken.connect(treasury).addBuilder(await user.getAddress())
    await ResiToken.connect(treasury).enableExits()
    await ResiToken.connect(treasury).award(await user.getAddress(), '10', 2)

    const token = await deployMockERC20({name: 'TERC20', symbol: 'TERC20'})
    await ResiToken.connect(treasury).setValueToken(await token.getAddress())

    // WHEN // THEN
    await expect(ResiToken.connect(user).exit(2)).to.be.revertedWithCustomError(ResiToken, 'InvalidQuote')
  })

  it('Should allow to pause contract and then upause it', async () => {
    // GIVEN
    const initialContractState = await ResiToken.connect(treasury).paused()
    // WHEN
    await ResiToken.connect(treasury).pause()
    const middleContractState = await ResiToken.connect(treasury).paused()
    await ResiToken.connect(treasury).unpause()
    const finalContractState = await ResiToken.connect(treasury).paused()
    // THEN
    // eslint-disable-next-line no-unused-expressions
    expect(initialContractState).to.be.false
    // eslint-disable-next-line no-unused-expressions
    expect(middleContractState).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(finalContractState).to.be.false
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
