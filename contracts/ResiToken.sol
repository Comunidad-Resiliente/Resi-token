// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IResiToken} from "./interfaces/IResiToken.sol";
import {IResiVault} from "./interfaces/IResiVault.sol";
import {ResiVault} from "./ResiVault.sol";

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Resi Token V1
 * @author Alejo Lovallo
 */
contract ResiToken is
    IResiToken,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// @dev BUILDER_ROLE
    bytes32 public constant BUILDER_ROLE = keccak256("BUILDER_ROLE");

    /// @dev SafeERC20 library (change contract calls)
    using SafeERC20 for IERC20;

    /// @dev Enumerable role set
    using EnumerableSet for EnumerableSet.Bytes32Set;
    EnumerableSet.Bytes32Set private _rolesSet;

    /// @dev token decimals.
    uint8 private _DECIMALS;

    /// @dev treasury address
    address public TREASURY;

    /// @dev exit state: whether exits are enable or not
    bool public EXIT_STATE;

    /// @dev Serie supply minted
    mapping(uint256 serieId => uint256 supplyEmitted) public serieSupplies;
    /// @dev User balance per serie
    mapping(uint256 serieId => mapping(address user => uint256 balance)) public userSerieBalance;
    /// @dev Vault serie id
    mapping(uint256 serieId => SerieVault vault) public serieVaults;

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize contract.
     * @param _decimals token decimals.
     * @param _treasury treasury address.
     * @param _builders array of builder addresses.
     */
    function initialize(uint8 _decimals, address _treasury, address[] calldata _builders) public initializer {
        if (_treasury == address(0)) revert InvalidAddress(_treasury);
        if (_decimals == 0) revert InvalidDecimals(_decimals);

        __ERC20_init_unchained("RESI-TOKEN", "RESI");
        __ReentrancyGuard_init_unchained();
        __ERC20Burnable_init_unchained();
        __ERC20Pausable_init_unchained();

        _rolesSet.add(BUILDER_ROLE);

        _DECIMALS = _decimals;

        TREASURY = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, TREASURY);
        _setRoleAdmin(BUILDER_ROLE, DEFAULT_ADMIN_ROLE);

        for (uint256 i; i < _builders.length; i++) {
            _addBuilder(_builders[i]);
        }

        emit ResiTokenInitialized(_treasury, _decimals);
    }

    /**************************** GETTERS  ****************************/

    ///@dev Version for upgradeable version
    ///@return version
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @dev See {ERC20Upgradeable}
     */
    function decimals() public view override(ERC20Upgradeable, IResiToken) returns (uint8) {
        return _DECIMALS;
    }

    /**
     * #dev Returns whether an address is a builder.
     * @param _builder address.
     */
    function isBuilder(address _builder) public view returns (bool) {
        return hasRole(BUILDER_ROLE, _builder);
    }

    /**************************** SETTERS  ****************************/

    /**
     * @dev Pause contract.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _pause();
    }

    /**
     * @dev Unpause contract.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        _unpause();
    }

    /**
     * @dev Enable exits and thus users will be able to change their resi-tokens.
     */
    function enableExits() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        EXIT_STATE = true;
        emit ExitStateUpdated(true);
    }

    /**
     * @dev Disable exits.
     */
    function disableExits() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        EXIT_STATE = false;
        emit ExitStateUpdated(false);
    }

    /**
     * @dev Set serie vault
     * @param _vault vault address.
     * @param _serieId serie id.
     */
    function setSerieVault(address _vault, uint256 _serieId) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_vault == address(0)) revert InvalidVault(_vault);
        if (_serieId == 0) revert InvalidSerie(_serieId);
        address oldVault = serieVaults[_serieId].vault;
        serieVaults[_serieId].vault = _vault;
        serieVaults[_serieId].active = true;
        emit SerieVaultUpdated(_serieId, oldVault, _vault);
    }

    /**
     * @dev enable or disable serie vault.
     * @param _serieId serie id.
     * @param _status new serie vault status.
     */
    function updateSerieVaultStatus(
        uint256 _serieId,
        bool _status
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_serieId == 0) revert InvalidSerie(_serieId);
        serieVaults[_serieId].active = _status;
        emit SerieVaultStatusUpdated(_serieId, _status);
    }

    /**
     * @dev Add new builder.
     * @param _builder address.
     */
    function addBuilder(address _builder) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _addBuilder(_builder);
    }

    /**
     * @dev Remove builder user.
     * @param _builder builder address.
     */
    function removeBuilder(address _builder) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_builder == address(0)) {
            revert InvalidAddress(_builder);
        }
        if (!hasRole(BUILDER_ROLE, _builder)) {
            revert InvalidBuilder(_builder);
        }
        _revokeRole(BUILDER_ROLE, _builder);

        emit BuilderRemoved(_builder);
    }

    /**
     * @dev Add builders batch.
     * @param _builders array of builder addresses.
     */
    function addBuildersBatch(address[] memory _builders) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        for (uint256 i = 0; i < _builders.length; ++i) {
            _addBuilder(_builders[i]);
        }
    }

    /**
     * @dev Mint builder Resi tokens.
     * @param _to builder address.
     * @param _amount amount to mint/award.
     * @param _serieId serie id.
     */
    function award(address _to, uint256 _amount, uint256 _serieId) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _award(_to, _amount, _serieId);
    }

    /**
     * @dev Mint batch users
     * @param _users array of users address (must be builders).
     * @param _amounts array of amounts.
     * @param _serieId serie id.
     */
    function awardBatch(
        address[] memory _users,
        uint256[] memory _amounts,
        uint256 _serieId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        require(_users.length == _amounts.length, "RESIToken: users and amounts length mismatch");
        for (uint256 i = 0; i < _users.length; i++) {
            _award(_users[i], _amounts[i], _serieId);
        }
    }

    /**
     * @dev Burn Resi tokens.
     * @param _value amount to burn.
     * @param _serieId serie id.
     */
    function burn(uint256 _value, uint256 _serieId) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_serieId == 0) revert InvalidSerie(_serieId);
        _burn(address(this), _value);
        serieSupplies[_serieId] -= _value;
        emit ResiTokenBurnt(_value, _serieId);
    }

    /**
     * @dev Change Resi tokens for stable value token.
     * @param _serieId serie id.
     */
    function exit(uint256 _serieId) external whenExitIsEnabled nonReentrant {
        _checkExit(_serieId);

        uint256 userBalance = userSerieBalance[_serieId][_msgSender()];
        uint256 quote = IResiVault(serieVaults[_serieId].vault).getExitQuote(userBalance, serieSupplies[_serieId]);

        if (quote > 0) {
            _transfer(_msgSender(), address(this), userBalance);
            IResiVault(serieVaults[_serieId].vault).release(_msgSender(), userBalance, serieSupplies[_serieId]);
            userSerieBalance[_serieId][_msgSender()] = 0;
            emit Exit(_msgSender(), quote, _serieId);
        } else {
            revert InvalidQuote(userBalance, serieSupplies[_serieId], quote);
        }
    }

    /**
     * @dev Withdrawn stable token funds from vault dust back to the treasury.
     */
    function withdrawSerieVaultToken(uint256 _serieId) external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        if (serieVaults[_serieId].vault == address(0) || !serieVaults[_serieId].active)
            revert InvalidSerieVault(_serieId, serieVaults[_serieId].vault);

        uint256 amountWithdrawn = IResiVault(serieVaults[_serieId].vault).withdrawToTreasury(TREASURY);

        emit ValueTokenWithdrawn(_serieId, amountWithdrawn);
    }

    /**
     *  @dev It is not allowed to transfer resi token
     */
    function transfer(address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferForbidden("RESIToken: NO TRANSFER ALLOWED");
    }

    /**
     * @dev It is not allowed to transfer resi token
     */
    function transferFrom(address, address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferFromForbidden("RESIToken: NO TRANSFER FROM ALLOWED");
    }

    /**
     * @dev See {ERC20Upgradeable}
     */
    function burn(uint256) public pure override(ERC20BurnableUpgradeable) {
        revert BurnForbbidden();
    }

    /**
     * @dev See {ERC20Upgradeable}
     */
    function burnFrom(address, uint256) public pure override(ERC20BurnableUpgradeable) {
        revert BurnForbbidden();
    }

    /**************************** INTERNAL  ****************************/

    /**
     * #dev internal function to add builder.
     * @param _builder address of the builder.
     */
    function _addBuilder(address _builder) internal onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_builder == address(0)) revert InvalidAddress(_builder);
        if (hasRole(BUILDER_ROLE, _builder)) {
            revert AlreadyBuilder(_builder);
        }
        _grantRole(BUILDER_ROLE, _builder);
        emit BuilderAdded(_builder);
    }

    /**
     * @dev Internal function for award function.
     * @param _user builder address.
     * @param _amount amount to award.
     * @param _serieId serie id.
     */
    function _award(
        address _user,
        uint256 _amount,
        uint256 _serieId
    ) internal onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        if (_serieId == 0) revert InvalidSerie(_serieId);
        if (_user == address(0)) revert InvalidAddress(_user);
        if (_amount == 0) revert InvalidAmount(_amount);
        if (!hasRole(BUILDER_ROLE, _user)) revert InvalidBuilder(_user);
        _mint(_user, _amount);
        serieSupplies[_serieId] += _amount;
        userSerieBalance[_serieId][_user] += _amount;
        emit UserAwarded(_user, _amount, _serieId);
    }

    /**
     * @dev Internal function to perform valid exit
     */
    function _checkExit(uint256 _serieId) internal view {
        if (_msgSender() == TREASURY) revert InvalidAddress(_msgSender());
        if (!hasRole(BUILDER_ROLE, _msgSender())) revert InvalidBuilder(_msgSender());
        if (serieVaults[_serieId].vault == address(0) || !serieVaults[_serieId].active)
            revert InvalidSerieVault(_serieId, serieVaults[_serieId].vault);
        if (serieSupplies[_serieId] == 0) revert SerieWithNoMintedSupply(_serieId);
        if (userSerieBalance[_serieId][_msgSender()] == 0)
            revert InvalidUserSerieBalance(userSerieBalance[_serieId][_msgSender()]);
    }

    /**
     * @dev See {ERC20Upgradeable}
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20PausableUpgradeable, ERC20Upgradeable) whenNotPaused {
        ERC20PausableUpgradeable._update(from, to, value);
    }

    /**************************** MODIFIERS  ****************************/

    /**
     * @dev modifier to check exit state.
     */
    modifier whenExitIsEnabled() {
        require(!paused() && EXIT_STATE, "RESIToken: Exits disabled");
        _;
    }

    /// @dev Leave a gap betweeen inherited contracts variables in order
    /// @dev to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
