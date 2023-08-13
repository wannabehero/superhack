// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {Test, console2} from "forge-std/Test.sol";
import {DemoToken} from "../src/DemoToken.sol";
import {Donation} from "../src/Donation.sol";

contract DemoTokenTest is Test {
    DemoToken public token;
    Donation public donation;

    address private _sender = address(0xdead);

    function setUp() public {
        token = new DemoToken(address(0));
        donation = new Donation(address(0));
    }

    function testDonateERC20Failed(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount > 0);

        assertEq(token.balanceOf(to), 0);

        token.mint(_sender, amount);

        vm.startPrank(_sender);
        vm.expectRevert("Donation: insufficient allowance");
        donation.donateERC20(token, to, amount);
        vm.stopPrank();
    }

    function testDonateERC20(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount > 0);

        assertEq(token.balanceOf(to), 0);

        token.mint(_sender, amount);

        vm.startPrank(_sender);
        token.approve(address(donation), amount);
        donation.donateERC20(token, to, amount);
        vm.stopPrank();

        assertEq(token.balanceOf(to), amount);
    }

    function testDonateETHFailed(address to) public {
        vm.assume(to != address(0));

        vm.expectRevert("Donation: no ETH sent");
        vm.startPrank(_sender);
        donation.donateETH{value: 0}(to);
        vm.stopPrank();
    }

    function testDonateETH(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount > 0);

        vm.deal(_sender, amount);
        vm.startPrank(_sender);
        donation.donateETH{value: amount}(to);
        vm.stopPrank();

        assertEq(to.balance, amount);
        assertEq(address(donation).balance, 0);
        assertEq(_sender.balance, 0);
    }
}
