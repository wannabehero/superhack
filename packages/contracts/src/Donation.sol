// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Donation is ERC2771Context, ReentrancyGuard {
    event DonateERC20(address indexed from, address indexed to, address token, uint256 amount);
    event DonateETH(address indexed from, address indexed to, uint256 amount);

    constructor(address trustredForwarder)
        ERC2771Context(trustredForwarder)
    {}

    function donateERC20(IERC20 token, address to, uint256 amount) nonReentrant external {
        require(token.allowance(_msgSender(), address(this)) >= amount, "Donation: insufficient allowance");

        bool sent = token.transferFrom(_msgSender(), to, amount);
        require(sent, "Donation: failed to send ERC20");

        emit DonateERC20(_msgSender(), to, address(token), amount);
    }

    function donateETH(address to) nonReentrant external payable {
        require(msg.value > 0, "Donation: no ETH sent");

        (bool sent, ) = payable(to).call{value: msg.value}("");
        require(sent, "Donation: failed to send ETH");

        emit DonateETH(_msgSender(), to, msg.value);
    }
}
