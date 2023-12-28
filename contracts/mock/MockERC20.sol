// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

contract MockERC20 is ERC20Burnable, AccessControlEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using EnumerableSet for EnumerableSet.Bytes32Set;
    EnumerableSet.Bytes32Set private _rolesSet;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_) {
        _rolesSet.add(MINTER_ROLE);

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _mint(msg.sender, initialSupply);
    }

    function addMinter(address _minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, _minter);
    }

    function mint() external onlyMinter {
        _mint(msg.sender, 10000000 ether);
    }

    function mintTo(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    modifier onlyMinter() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) || hasRole(MINTER_ROLE, _msgSender()), "INVALID PERMISSION");
        _;
    }
}
