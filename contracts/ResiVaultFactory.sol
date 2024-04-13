// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IResiVaultFactory} from "./interfaces/IResiVaultFactory.sol";
import {ResiVault} from "./ResiVault.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract ResiVaultFactory is IResiVaultFactory, Ownable {
    /// @dev Wrapped Token implementation
    address public immutable resiVaultImplementation;

    /// @dev List of Resi Vaults
    ResiVault[] public resiVaults;

    constructor(address _treasury) Ownable(_treasury) {
        if (_treasury == address(0)) revert InvalidAddress(_treasury);

        /// @dev Wrapped token implementation contract
        resiVaultImplementation = address(new ResiVault());

        emit ResiVaultFactoryInitialized(_treasury);
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev Create Wrapped token.
     * @param name token name.
     * @param symbol token symbol.
     * @param _tokenTransferContract Token Transfer contract address to be designed as minter.
     */
    function createVault() external onlyOwner returns (address) {
        if (_tokenTransferContract == address(0)) revert InvalidAddress(_tokenTransferContract);

        address clone = Clones.clone(tokenImplementation);

        ResiVault(clone).initialize(name, symbol, decimals, BRIDGE_REGISTRY, _tokenTransferContract);

        wrappedTokens.push(WrappedToken(clone));

        emit WrappedTokenCreated(clone);

        return clone;
    }

    /**
     * @dev get list of created wrapped tokens.
     */
    function getTokens() external view returns (ResiVault[] memory) {
        return resiVaults;
    }
}
