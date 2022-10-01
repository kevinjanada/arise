import { task } from "hardhat/config";
import addresses from "../config/addresses.json";
import { FakeUSDC } from "../typechain-types";

task("mint-fusdc", "Deploy FUSDC")
  .addParam("amount")
  .addOptionalParam("to")
  .setAction(async ({ amount, to }, { ethers, run, artifacts }) => {
    await run("compile");

    const { chainId } = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();

    const nonce = await deployer.getTransactionCount();

    const { abi } = await artifacts.readArtifact("FakeUSDC");

    const FUSDC = new ethers.Contract(
      addresses["FUSDC"][chainId],
      abi,
      deployer,
    ) as FakeUSDC;

    const decimals = await FUSDC.decimals();

    const recipient = to ? to : deployer.address
    // Mint 1000 units to contract owner
    const tx = await FUSDC.mint(
      recipient,
      ethers.utils.parseUnits(amount, decimals),
      { nonce }
    );
    await tx.wait();

    const balance = await FUSDC.balanceOf(recipient);
    console.log(`Balance of ${recipient} is now ${ethers.utils.formatUnits(balance, decimals)}`);
});

