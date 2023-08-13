// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;

import {Script, console2} from "forge-std/Script.sol";

import {Donation} from "../src/Donation.sol";

contract DeployDonationScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // trusted forwarder is gelato erc2771
        Donation donation = new Donation{salt: bytes32(uint256(133780085))}(
            0xb539068872230f20456CF38EC52EF2f91AF4AE49
        );

        vm.stopBroadcast();
    }
}
