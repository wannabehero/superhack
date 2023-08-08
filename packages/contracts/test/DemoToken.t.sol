// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {Test, console2} from "forge-std/Test.sol";
import {DemoToken} from "../src/DemoToken.sol";

contract DemoTokenTest is Test {
    DemoToken public token;

    function setUp() public {
        token = new DemoToken(address(0));
    }

    function testInit() public {
        assertEq(token.name(), "DemoToken");
        assertEq(token.symbol(), "TKN");
    }

    function testMint(address to, uint256 amount) public {
        vm.assume(to != address(0));

        token.mint(to, amount);
        assertEq(token.balanceOf(to), amount);
    }
}
