// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IResiVaultFactory} from "./interfaces/IResiVaultFactory.sol";
import {ResiVault} from "./ResiVault.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract ResiVaultFactory is IResiVaultFactory, Ownable {
    /// @dev Wrapped Token implementation
    address public immutable resiVaultImplementation;

    /// @dev Resi token contract.
    address public immutable RESI_TOKEN;

    /// @dev List of Resi Vaults
    ResiVault[] public resiVaults;

    /**
     * @dev Initialize contract
     * @param _treasury treasury address.
     * @param _resiToken Resi token address.
     */
    constructor(address _treasury, address _resiToken) Ownable(_treasury) {
        if (_treasury == address(0)) revert InvalidAddress(_treasury);
        if (_resiToken == address(0)) revert InvalidAddress(_resiToken);

        /// @dev Wrapped token implementation contract
        resiVaultImplementation = address(new ResiVault());

        RESI_TOKEN = _resiToken;

        emit ResiVaultFactoryInitialized(_treasury, _resiToken);
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev Create Resi Vault.
     * @param _stableToken stable token address.
     * @param _serieId Serie id.
     */
    function createVault(address _stableToken, uint256 _serieId) external onlyOwner returns (address) {
        if (_stableToken == address(0)) revert InvalidAddress(_stableToken);
        if (_serieId == 0) revert InvalidSerie(_serieId);

        address clone = Clones.clone(resiVaultImplementation);

        ResiVault(clone).initialize(_msgSender(), RESI_TOKEN, _stableToken, _serieId);

        resiVaults.push(ResiVault(clone));

        emit ResiVaultCreated(clone);

        return clone;
    }

    /**
     * @dev get list of created vaults.
     */
    function getVaults() external view returns (ResiVault[] memory) {
        return resiVaults;
    }
}
