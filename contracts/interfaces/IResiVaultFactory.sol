// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiVaultFactory {
    event ResiVaultFactoryInitialized(address treasury, address resiToken);
    event ResiVaultCreated(address indexed resiVault);

    error InvalidAddress(address adr);
    error InvalidSerie(uint256 serieId);
}
