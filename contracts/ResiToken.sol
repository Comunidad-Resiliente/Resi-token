// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IResiToken} from "./interfaces/IResiToken.sol";

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "@opezeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ResiToken is
    IResiToken,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable
{
    ///@dev BUILDER_ROLE
    bytes32 public constant BUILDER_ROLE = keccak256("BUILDER_ROLE");

    using EnumerableSet for EnumerableSet.Bytes32Set;
    EnumerableSet.Bytes32Set private _rolesSet;

    uint8 private _DECIMALS;

    address public TREASURY;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _treasury
    ) public initializer {
        if (_treasury == address(0)) revert InvalidAddress(_treasury);
        if (_decimals == 0) revert InvalidDecimals(_decimals);

        __ERC20_init_unchained(_name, _symbol);
        __ReentrancyGuard_init_unchained();
        __ERC20Burnable_init_unchained();
        __ERC20Pausable_init_unchained();

        _rolesSet.add(BUILDER_ROLE);

        _DECIMALS = _decimals;

        TREASURY = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, TREASURY);
        _setRoleAdmin(BUILDER_ROLE, TREASURY);
    }

    /**************************** GETTERS  ****************************/

    ///@dev Version for upgradeable version
    ///@return version
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    function decimals() public view override(ERC20Upgradeable, IWrappedToken) returns (uint8) {
        return _DECIMALS;
    }

    /**************************** SETTERS  ****************************/
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        _unpause();
    }

    function addBuilder(address _builder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_builder == address(0)) revert InvalidAddress(_builder);
        if (hasRole(BUILDER_ROLE, _builder)) {
            revert AlreadyBuilder(_builder);
        }
        _grantRole(BUILDER_ROLE, _builder);
        emit BuilderAdded(_builder);
    }

    function addBuilderBatch() external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function removeBuilder(address _minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_minter == address(0)) {
            revert InvalidAddress(_minter);
        }
        if (!hasRole(MINTER_ROLE, _minter)) {
            revert InvalidMinter(_minter);
        }
        _revokeRole(MINTER_ROLE, _minter);

        emit MinterRemoved(_minter);
    }

    function award(address _to, uint256 _amount) external onlyMinter {
        _mint(_to, _amount);
        emit MintWrappedToken(_to, _amount);
    }

    function burn(uint256 value) public override(ERC20BurnableUpgradeable, IResiToken) onlyMinter {
        super.burn(value);
        emit BurnResiToken(_msgSender(), value);
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

    /**************************** MODIFIERS  ****************************/

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, _msgSender()), "INVALID PERMISSIONS");
        _;
    }
}
