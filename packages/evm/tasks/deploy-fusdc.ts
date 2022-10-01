import { task } from "hardhat/config";
import addresses from "../config/addresses.json";
import * as fs from "fs";
import * as path from "path";

type Addresses = Record<string, Record<number, string>>;

task("deploy-fusdc", "Deploy FUSDC").setAction(async (_, { ethers, run }) => {
  await run("compile");

  const { chainId } = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();

  const nonce = await deployer.getTransactionCount();

  const FUSDC = await ethers.getContractFactory("FakeUSDC");
  const fusdc = await FUSDC.deploy({ nonce: nonce });

  await fusdc.deployed();

  console.log("FUSDC Deployed to :", fusdc.address);

  if (!addresses["FUSDC"]) {
    (addresses as Addresses)["FUSDC"] = { [chainId]: "" };
  }
  addresses["FUSDC"][chainId] = fusdc.address;

  fs.writeFileSync(
    path.join(__dirname, "../config/addresses.json"),
    JSON.stringify(addresses, undefined, 2)
  );

  return fusdc.address;
});

