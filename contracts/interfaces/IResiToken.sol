// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiToken {
    function decimals() external view returns (uint8);

    function exit(uint256 _serieId) external;

    event ResiTokenInitialized(address treasury, address _token, uint8 decimals);
    event BuilderAdded(address newMinter);
    event BuilderRemoved(address builder);
    event ResiTokenBurnt(uint256 value, uint256 serieId);
    event UserAwarded(address user, uint256 amount, uint256 serieId);
    event ValueTokenUpdated(address oldToken, address newToken);
    event Exit(address indexed user, uint256 amount, uint256 serieId);
    event ExitStateUpdated(bool update);
    event ValueTokenWithdrawn(uint256 amount);

    error InvalidAddress(address adr);
    error InvalidAmount(uint256 amount);
    error InvalidSerie(uint256 serieId);
    error InvalidBuilder(address builder);
    error InvalidDecimals(uint8 decimals);
    error AlreadyBuilder(address builder);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
    error InvalidQuote(uint256 currentValueTokenBalance, uint256 userBalance, uint256 serieSupplies, uint256 quote);
    error SerieWithNoMintedSupply(uint256 serieId);
    error InvalidUserSerieBalance(uint256 amount);
    error BurnForbbidden();
}
