// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiToken {
    function decimals() external view returns (uint8);

    function burn(uint256 value) external;

    event ResiTokenInitialized(address treasury, uint8 decimals);
    event BuilderAdded(address newMinter);
    event BuilderRemoved(address builder);
    event BurnResiToken(address user, uint256 value);
    event ResiTokenMinted(address user, uint256 amount);

    error InvalidAddress(address adr);
    error InvalidAmount(uint256 amount);
    error AlreadyBuilder(address builder);
    error InvalidBuilder(address builder);
    error InvalidDecimals(uint8 decimals);
    error NotBuilder(address user);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
}
