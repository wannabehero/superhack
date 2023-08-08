// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {Test, console2} from "forge-std/Test.sol";
import {DemoToken} from "../src/DemoToken.sol";
import {DemoSpender} from "../src/DemoSpender.sol";

contract DemoTokenTest is Test {
    DemoToken public token;
    DemoSpender public spender;

    function setUp() public {
        token = new DemoToken(address(0));
        spender = new DemoSpender(address(0));
    }

    function testSpend(address to, uint256 amount) public {
        vm.assume(to != address(0));

        token.mint(address(this), amount);
        token.approve(address(spender), amount);
        spender.spend(token, to, amount);
    }
}
