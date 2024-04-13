// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiVault {
    function getExitQuote(uint256 _userResiTokens, uint256 _serieSupply) external view returns (uint256 quote);

    function getStableTokenBalance() external view returns (uint256 balance);

    function release(address _builder, uint256 _userResiTokens, uint256 _serieSupply) external;

    function withdrawToTreasury(address _treasury) external returns (uint256 amountWithdrawn);

    event ResiVaultInitialized(address resiToken, address stableToken, uint256 serieId);
    event ValueTokenUpdated(address oldToken, address newToken);
    event TokenReleased(address indexed builder, uint256 amount);
    event WithdrawnToTreasury(uint256 amount);

    error InvalidAddress(address adr);
    error InvalidQuote(uint256 amount);
    error InvalidSerie(uint256 serieId);
    error InvalidResiTokensAmount(uint256 amount);
    error InvalidResiSerieSupply(uint256 supply);
    error UnsufficientStableTokensToWithdrawn(uint256 amount);
}
