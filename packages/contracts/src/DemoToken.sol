// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {ERC20, Context} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract DemoToken is ERC20, Ownable, ERC2771Context {
    constructor(address trustedForwarder)
        ERC20("DemoToken", "TKN")
        ERC2771Context(trustedForwarder)
    {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
