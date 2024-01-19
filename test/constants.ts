import {keccak256, toUtf8Bytes} from 'ethers'

export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const BUILDER_ROLE = keccak256(toUtf8Bytes('BUILDER_ROLE'))
export const PAUSER_ROLE = keccak256(toUtf8Bytes('PAUSER_ROLE'))
