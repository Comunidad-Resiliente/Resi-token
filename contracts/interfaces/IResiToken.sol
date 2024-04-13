// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiToken {
    struct SerieVault {
        address vault;
        bool active;
    }

    function decimals() external view returns (uint8);

    function exit(uint256 _serieId) external;

    event ResiTokenInitialized(address treasury, uint8 decimals);
    event BuilderAdded(address newMinter);
    event BuilderRemoved(address builder);
    event ResiTokenBurnt(uint256 value, uint256 serieId);
    event UserAwarded(address user, uint256 amount, uint256 serieId);
    event Exit(address indexed user, uint256 amount, uint256 serieId);
    event ExitStateUpdated(bool update);
    event ValueTokenWithdrawn(uint256 serieId, uint256 amount);
    event SerieVaultStatusUpdated(uint256 serieId, bool newStatus);
    event SerieVaultUpdated(uint256 serieId, address oldVault, address newVault);

    error InvalidAddress(address adr);
    error InvalidAmount(uint256 amount);
    error InvalidSerie(uint256 serieId);
    error InvalidBuilder(address builder);
    error InvalidDecimals(uint8 decimals);
    error AlreadyBuilder(address builder);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
    error InvalidQuote(uint256 userBalance, uint256 serieSupplies, uint256 quote);
    error SerieWithNoMintedSupply(uint256 serieId);
    error InvalidUserSerieBalance(uint256 amount);
    error BurnForbbidden();
    error InvalidVault(address vault);
    error InvalidSerieVault(uint256 serieId, address vault);
}
