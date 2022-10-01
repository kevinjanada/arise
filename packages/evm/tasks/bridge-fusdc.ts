import { task } from "hardhat/config";
import addresses from "../config/addresses.json";
import { FakeUSDC } from "../typechain-types";
import Bridge from "wormhole/ethereum/build/contracts/BridgeImplementation.json";
import { getEmitterAddressEth, parseSequenceFromLogEth } from "@certusone/wormhole-sdk";

/**
* https://book.wormhole.com/technical/evm/tokenLayer.html#basic-transfer
* */


task("bridge-fusdc", "Deploy FUSDC")
  .addParam("amount")
  .addOptionalParam("to")
  .setAction(async ({ amount, to }, { ethers, artifacts }) => {
    const { chainId } = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();

    let nonce = await ethers.provider.getTransactionCount(deployer.address);

    const coreBridgeAddress = "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550";
    const tokenBridgeAddress = "0x0290FB167208Af455bB137780163b7B7a9a10C16";

    const { abi } = await artifacts.readArtifact("FakeUSDC");
    const FUSDC = new ethers.Contract(
      addresses["FUSDC"][chainId],
      abi,
      deployer,
    ) as FakeUSDC;

    const decimals = await FUSDC.decimals();

    let tx = await FUSDC.approve(
      tokenBridgeAddress,
      ethers.utils.parseUnits(amount, decimals),
    )
    await tx.wait();

    const recipient = to ? to : deployer.address

    const tokenBridge = new ethers.Contract(
      tokenBridgeAddress,
      Bridge.abi,
      deployer,
    );

    const senderChainId = 2;
    const recipientChainId = 4;
    const recipientAddrBytes = ethers.utils.zeroPad(ethers.utils.arrayify(recipient), 32);
    console.log({ recipientAddrBytes });

    nonce = await ethers.provider.getTransactionCount(deployer.address);
    tx = await tokenBridge.attestToken(
      addresses["FUSDC"][chainId], // token address
      nonce,
    );
    await tx.wait();

    nonce = await ethers.provider.getTransactionCount(deployer.address);
    tx = await tokenBridge.transferTokens(
      addresses["FUSDC"][chainId], // token address
      ethers.utils.parseUnits(amount, decimals), // amount
      recipientChainId, // 
      recipientAddrBytes,
      0,
      nonce,
    )
    let receipt = await tx.wait();

    console.log("Transfer Tokens on its way");
    // console.log(receipt);

    const wormholeRestAddress = "http://localhost:7071";

    console.log("Fetching VAA from guardian");

    const emitterAddr = getEmitterAddressEth(tokenBridgeAddress);
    console.log({ emitterAddr });
    const seq = parseSequenceFromLogEth(receipt, coreBridgeAddress);
    console.log({ seq });
    const vaaURL = `${wormholeRestAddress}/v1/signed_vaa/${senderChainId}/${emitterAddr}/${seq}`;
    console.log({ vaaURL });
    let vaaBytes = await (await fetch(vaaURL)).json();
    while (!vaaBytes.vaaBytes) {
      console.log("VAA not found, retrying in 5s!");
      await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
      vaaBytes = await (await fetch(vaaURL)).json();
    }

    console.log({ vaaBytes });

    // vaaBytes = Buffer.from(vaaBytes.vaaBytes);
    vaaBytes = Uint8Array.from(vaaBytes.vaaBytes);
    console.log({ vaaBytes });

    /**
    * 
    * This should be done on Target Chain
    * Via Relayer??? 
    *
    tx = await tokenBridge.completeTransfer(vaaBytes);
    receipt = await tx.wait();

    console.log("Token bridging complete");

    console.log({ receipt });
    * */
});
