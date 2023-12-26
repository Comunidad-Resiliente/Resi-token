// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IResiToken {
    function mintTo(address to, uint256 amount) external;

    function decimals() external view returns (uint8);

    function burn(uint256 value) external;

    event MinterAdded(address newMinter);
    event BurnWrappedToken(address user, uint256 value);
    event MinterRemoved(address minter);
    event MintWrappedToken(address user, uint256 amount);

    error InvalidAddress(address adr);
    error AlreadyMinter(address minter);
    error InvalidMinter(address minter);
    error InvalidDecimals(uint8 decimals);
}
