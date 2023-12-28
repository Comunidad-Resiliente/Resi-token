import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {ResiToken} from '../typechain-types'
// import {deployMockERC20} from './utils'
import {DEFAULT_ADMIN_ROLE, BUILDER_ROLE} from './constants'

describe('Bridge Registry', () => {
  let deployer: Signer
  let treasury: Signer
  // let invalidSigner: Signer
  let ResiToken: ResiToken
  let MockToken: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    // const signers = await ethers.getSigners ()
    deployer = await ethers.getSigner(accounts.deployer)
    treasury = await ethers.getSigner(accounts.treasury)
    // invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const {ResiTokenContract, MockTokenContract} = await resiMainFixture()
    ResiToken = ResiTokenContract
    MockToken = MockTokenContract
  })

  it('Correct initialization', async () => {
    // GIVEN // WHEN
    const version: string = await ResiToken.version()

    const amountOfAdmins = await ResiToken.getRoleMemberCount(DEFAULT_ADMIN_ROLE)
    const amountOfBuilders = await ResiToken.getRoleMemberCount(BUILDER_ROLE)
    const adminRole = await ResiToken.getRoleAdmin(DEFAULT_ADMIN_ROLE)
    const deployerIsAdmin = await ResiToken.hasRole(DEFAULT_ADMIN_ROLE, await deployer.getAddress())
    const treasuryIsAdmin = await ResiToken.hasRole(DEFAULT_ADMIN_ROLE, await treasury.getAddress())
    const token = await ResiToken.STABLE_TOKEN()

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
  })
})
