// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IResiVault} from "./interfaces/IResiVault.sol";

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Resi Vault V1
 * @dev Vault meant to save serie funds.
 * @author Alejo Lovallo
 */
contract ResiVault is IResiVault, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    ///@dev SERIE ID linked to Vault
    uint256 public SERIE_ID;

    /// @dev stable token to make exits
    address public STABLE_TOKEN;

    ///@dev Resi token contract
    address public RESI_TOKEN;

    using SafeERC20 for IERC20;

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize contract.
     * @param _treasury treasury address.
     * @param _resiToken It´s the ResiToken contract.
     * @param _stableToken Stable token for exits.
     * @param _serieId Serie which this vault belongs.
     */
    function initialize(
        address _treasury,
        address _resiToken,
        address _stableToken,
        uint256 _serieId
    ) public initializer {
        if (_treasury == address(0)) revert InvalidAddress(_treasury);
        if (_resiToken == address(0)) revert InvalidAddress(_resiToken);
        if (_stableToken == address(0)) revert InvalidAddress(_stableToken);
        if (_serieId == 0) revert InvalidSerie(_serieId);

        __Context_init_unchained();
        __Ownable_init_unchained(_treasury);
        __ReentrancyGuard_init_unchained();

        RESI_TOKEN = _resiToken;
        STABLE_TOKEN = _stableToken;
        SERIE_ID = _serieId;

        emit ResiVaultInitialized(_resiToken, _stableToken, _serieId);
    }

    /**************************** GETTERS  ****************************/

    ///@dev Version for upgradeable version
    ///@return version
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @dev Get exit quote from resi tokens to stable token.
     * @param _userResiTokens builder resi tokens balance.
     * @param _serieSupply Resi tokens minted during the serie.
     */
    function getExitQuote(uint256 _userResiTokens, uint256 _serieSupply) public view returns (uint256 quote) {
        if (_serieSupply == 0) return 0;
        return (_userResiTokens * IERC20(STABLE_TOKEN).balanceOf(address(this))) / _serieSupply;
    }

    /**
     * @dev Return vault stable token balance.
     */
    function getStableTokenBalance() external view returns (uint256 balance) {
        return IERC20(STABLE_TOKEN).balanceOf(address(this));
    }

    /**************************** SETTERS  ****************************/

    /**
     * @dev Set new value token to exchange against resi-tokens.
     * @param _newToken address of the new token.
     */
    function setValueToken(address _newToken) external onlyOwner {
        if (_newToken == address(0)) revert InvalidAddress(_newToken);
        address oldToken = STABLE_TOKEN;
        STABLE_TOKEN = _newToken;
        emit ValueTokenUpdated(oldToken, _newToken);
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev Release stable tokens to builders.
     * @param _builder builder address.
     * @param _userResiTokens user resi tokens.
     * @param _serieSupply current serie supply.
     */
    function release(
        address _builder,
        uint256 _userResiTokens,
        uint256 _serieSupply
    ) external onlyResiToken nonReentrant {
        if (_builder == address(0)) revert InvalidAddress(_builder);
        if (_userResiTokens == 0) revert InvalidResiTokensAmount(_userResiTokens);
        if (_serieSupply == 0) revert InvalidResiSerieSupply(_serieSupply);

        uint256 quote = getExitQuote(_userResiTokens, _serieSupply);
        if (IERC20(STABLE_TOKEN).balanceOf(address(this)) <= quote) revert InvalidQuote(quote);

        IERC20(STABLE_TOKEN).safeTransfer(_builder, quote);

        emit TokenReleased(_builder, quote);
    }

    /**
     * @dev Send remaining dust funds back to treasury.
     * @param _treasury treasury address.
     */
    function withdrawToTreasury(address _treasury) external onlyResiToken returns (uint256 amountWithdrawn) {
        if (_treasury != owner()) revert InvalidAddress(_treasury);

        uint256 stableTokenBalance = IERC20(STABLE_TOKEN).balanceOf(address(this));
        if (stableTokenBalance > 0) {
            IERC20(STABLE_TOKEN).safeTransfer(_treasury, stableTokenBalance);
            emit WithdrawnToTreasury(stableTokenBalance);
            return stableTokenBalance;
        } else {
            revert UnsufficientStableTokensToWithdrawn(stableTokenBalance);
        }
    }

    /**************************** MODIFIERS  ****************************/

    modifier onlyResiToken() {
        require(_msgSender() == RESI_TOKEN, "RESIVault: ONLY RESI TOKEN");
        _;
    }

    /// @dev Leave a gap betweeen inherited contracts variables in order
    /// @dev to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
