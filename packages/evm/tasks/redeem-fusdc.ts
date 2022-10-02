import { task } from "hardhat/config";
import Bridge from "wormhole/ethereum/build/contracts/BridgeImplementation.json";
import addresses from "../config/addresses.json";
import { FakeUSDC } from "../typechain-types";

task("redeem-fusdc", "Deploy FUSDC")
  .addParam("vaastring")
  .setAction(async ({ vaastring }, { ethers, artifacts }) => {
    const { chainId } = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();
    console.log({ chainId });

    const tokenBridgeAddress = "0x0290FB167208Af455bB137780163b7B7a9a10C16";

    const tokenBridge = new ethers.Contract(
      tokenBridgeAddress,
      Bridge.abi,
      deployer,
    );

    const vaaBytes = Buffer.from(vaastring, "base64");
    console.log({ vaaBytes })

    try {
      const tx = await tokenBridge.completeTransfer(vaaBytes);
      const receipt = await tx.wait();

      console.log("Token bridging complete");
      console.log({ receipt });

      const wrappedFUSDCAddr = "0xEfA5151a425dc03DF0A8e68Ed05CeaBB962d1268";

      const { abi } = await artifacts.readArtifact("FakeUSDC");

      const FUSDC = new ethers.Contract(
        wrappedFUSDCAddr,
        abi,
        deployer,
      ) as FakeUSDC;

      const balanceOfRedeemer = await FUSDC.balanceOf(deployer.address);

      console.log(`Balance of redeemer is now ${balanceOfRedeemer}`);
    } catch (err) {
      console.log({ err })
    }
});