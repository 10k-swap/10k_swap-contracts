import { utils } from "ethers";
import { starknet } from "hardhat";
import { toFelt } from "starknet/dist/utils/number";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { hardhatCompile, stringToFelt } from "../test/util";

async function main() {
  await hardhatCompile("contracts/l0k_erc20.cairo");
  await hardhatCompile("contracts/l0k_pair.cairo");
  await hardhatCompile("contracts/l0k_factory.cairo");
  await hardhatCompile("contracts/l0k_router.cairo");

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

  // Deplo tokenA
  const tokenAContract = await l0kErc20ContractFactory.deploy({
    name: stringToFelt("10K Swap A"),
    symbol: stringToFelt("TKA"),
  });
  console.log("tokenAContract:", tokenAContract.address);

  // Deplo tokenB
  const tokenBContract = await l0kErc20ContractFactory.deploy({
    name: stringToFelt("10K Swap B"),
    symbol: stringToFelt("TKB"),
  });
  console.log("tokenBContract:", tokenBContract.address);

  const pairContractClassHash = await l0kPairContractFactory.declare();
  console.log("pairContractClassHash: ", pairContractClassHash);

  const l0kFactoryContract = await l0kFactoryContractFactory.deploy({
    pairClass: pairContractClassHash,
    feeToSetter:
      "0x07aA9CC1deFC55E199079357a4f27eDf687E7e65314a13dea44F5624d5fA2475",
  });
  console.log("l0kFactoryContract:", l0kFactoryContract.address);

  const l0kRouterContract = await l0kRouterContractFactory.deploy({
    factory: l0kFactoryContract.address,
    pairClass: pairContractClassHash,
  });
  console.log("l0kRouterContract:", l0kRouterContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
