import {
  DeclareOptions,
  DeployOptions,
} from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import hardhat, { starknet } from "hardhat";
import { stringToFelt } from "../test/util";

async function main() {
  await hardhat.run("starknet-compile", {
    paths: [
      "contracts/l0k_erc20.cairo",
      "contracts/l0k_pair.cairo",
      "contracts/l0k_factory.cairo",
      "contracts/l0k_router.cairo",
    ],
  });

  const starknetToken = process.env["STARKNET_TOKEN"] || "";
  const options: DeclareOptions | DeployOptions = { token: starknetToken };

  const feeToSetter = process.env["FEE_TO_SETTER"] || 0;
  console.log("feeToSetter:", feeToSetter);

  const l0kErc20ContractFactory = await starknet.getContractFactory(
    "l0k_erc20"
  );
  const l0kPairContractFactory = await starknet.getContractFactory("l0k_pair");
  const l0kFactoryContractFactory = await starknet.getContractFactory(
    "l0k_factory"
  );
  const l0kRouterContractFactory = await starknet.getContractFactory(
    "l0k_router"
  );

  // Dnot deploy tokens on alphaMainnet
  if (hardhat.config.starknet.network != "alphaMainnet") {
    // Deploy tokenA
    const tokenAContract = await l0kErc20ContractFactory.deploy(
      {
        name: stringToFelt("10K Swap A"),
        symbol: stringToFelt("TKA"),
      },
      options
    );
    console.log("tokenAContract:", tokenAContract.address);

    // Deploy tokenB
    const tokenBContract = await l0kErc20ContractFactory.deploy(
      {
        name: stringToFelt("10K Swap B"),
        symbol: stringToFelt("TKB"),
      },
      options
    );
    console.log("tokenBContract:", tokenBContract.address);
  }

  const pairContractClassHash = await l0kPairContractFactory.declare(options);
  console.log("pairContractClassHash: ", pairContractClassHash);

  const l0kFactoryContract = await l0kFactoryContractFactory.deploy(
    {
      pairClass: pairContractClassHash,
      feeToSetter,
    },
    options
  );
  console.log("l0kFactoryContract:", l0kFactoryContract.address);

  const l0kRouterContract = await l0kRouterContractFactory.deploy(
    {
      factory: l0kFactoryContract.address,
      pairClass: pairContractClassHash,
    },
    options
  );
  console.log("l0kRouterContract:", l0kRouterContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
