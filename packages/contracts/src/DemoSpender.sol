// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract DemoSpender is ERC2771Context {
    constructor(address trustredForwarder)
        ERC2771Context(trustredForwarder)
    {}

    function spend(IERC20 token, address to, uint256 amount) external {
        require(token.allowance(_msgSender(), address(this)) >= amount, "DemoSpender: insufficient allowance");

        token.transferFrom(_msgSender(), to, amount);
    }
}
