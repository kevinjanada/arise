// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "solmate/src/tokens/ERC20.sol";
import "solmate/src/auth/Owned.sol";

contract FakeUSDC is ERC20("FakeUSDC", "FUSDC", 6), Owned(msg.sender) {
  constructor() {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }
}
