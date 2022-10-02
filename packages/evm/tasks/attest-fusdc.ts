import { task } from "hardhat/config";
import addresses from "../config/addresses.json";
import { FakeUSDC } from "../typechain-types";
import Bridge from "wormhole/ethereum/build/contracts/BridgeImplementation.json";
import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

/**
* https://book.wormhole.com/technical/evm/tokenLayer.html#basic-transfer
* */


task("attest-fusdc", "Deploy FUSDC")
  .setAction(async (_, { ethers, artifacts }) => {
    const { chainId } = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();

    let nonce = await ethers.provider.getTransactionCount(deployer.address);

    const coreBridgeAddress = "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550";
    const tokenBridgeAddress = "0x0290FB167208Af455bB137780163b7B7a9a10C16";

    const tokenBridge = new ethers.Contract(
      tokenBridgeAddress,
      Bridge.abi,
      deployer,
    );

    nonce = await ethers.provider.getTransactionCount(deployer.address);
    const tx = await tokenBridge.attestToken(
      addresses["FUSDC"][chainId], // token address
      nonce,
    );
    const attestationReceipt = await tx.wait();

    const wormholeRestAddress = "http://localhost:7071";

    console.log("Fetching VAA from guardian");

    const senderChainId = 2; // ethereum

    const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
    const seq = parseSequenceFromLogEth(attestationReceipt, coreBridgeAddress);
    const vaaURL = `${wormholeRestAddress}/v1/signed_vaa/${senderChainId}/${emitterAddr}/${seq}`;
    let vaaBytes = await (await fetch(vaaURL)).json();
    while (!vaaBytes.vaaBytes) {
      console.log("VAA not found, retrying in 5s!");
      await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
      vaaBytes = await (await fetch(vaaURL)).json();
    }

    console.log("use this vaaBytes string as parameter to create-wrapped-fusdc")
    console.log(vaaBytes.vaaBytes);
});
