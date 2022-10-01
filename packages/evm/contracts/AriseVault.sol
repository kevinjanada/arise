// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "solmate/src/mixins/ERC4626.sol";

contract AriseVault is ERC4626 {
  constructor(
    ERC20 _asset,
    string memory _name,
    string memory _symbol
  ) ERC4626(_asset, _name, _symbol) {}

  function totalAssets() public view override returns (uint256) {
    return asset.balanceOf(address(this));
  }

  function afterDeposit(uint256 assets, uint256 shares) internal override {
    // TODO:
    // Either
    // Send the deposited tokens to Wormhole Token Bridge
    // Or
    // Keep it here and send a generic message to Wormhole Core Layer
  }
}
