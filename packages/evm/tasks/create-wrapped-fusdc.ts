import { task } from "hardhat/config";
import addresses from "../config/addresses.json";
import { FakeUSDC } from "../typechain-types";
import Bridge from "wormhole/ethereum/build/contracts/BridgeImplementation.json";
import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

/**
* https://book.wormhole.com/technical/evm/tokenLayer.html#basic-transfer
* */


task("create-wrapped-fusdc", "Deploy FUSDC")
  .addParam("vaastring")
  .setAction(async ({ vaastring }, { ethers, artifacts }) => {
    const { chainId } = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();

    // let nonce = await ethers.provider.getTransactionCount(deployer.address);

    // const coreBridgeAddress = "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550";
    const tokenBridgeAddress = "0x0290FB167208Af455bB137780163b7B7a9a10C16";

    const targetChainId = 4;

    const tokenAddress = addresses["FUSDC"][1];

    const tokenBridge = new ethers.Contract(
      tokenBridgeAddress,
      Bridge.abi,
      deployer,
    );

    const tx = await tokenBridge.createWrapped(
      Buffer.from(vaastring, "base64"),
    )
    await tx.wait();

    await new Promise((r) => setTimeout(r, 5000)); //Time out to let block propogate
    const wrappedTokenAddress = await tokenBridge.wrappedAsset(
      2, // sourceChainId
      Buffer.from(tryNativeToHexString(tokenAddress, "ethereum"), "hex")
    );
    console.log("Wrapped token created at: ", wrappedTokenAddress);
});

