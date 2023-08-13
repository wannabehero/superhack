// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

import {DemoSpender} from "../src/DemoSpender.sol";
import {DemoToken} from "../src/DemoToken.sol";

contract DeployDemoScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // trusted forwarder is 0 for now
        DemoSpender spender = new DemoSpender(address(0));
        DemoToken token = new DemoToken(address(0));

        vm.stopBroadcast();
    }
}
