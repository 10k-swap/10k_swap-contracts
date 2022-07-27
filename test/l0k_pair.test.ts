import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { envAccountOZ, hardhatCompile } from "./util";

describe("Amm pair", function () {
  let pairContractAddress: string;
  let l0kPairContract: StarknetContract;
  let account0: OpenZeppelinAccount;

  before(async function () {
    // Compile on ./l0k_pair.declare.test.ts
    // await hardhatCompile("contracts/l0k_pair.cairo");

    account0 = await envAccountOZ(0);

    pairContractAddress = <string>process.env.PAIR_CONTRACT_ADDRESS;
    const contractFactory = await starknet.getContractFactory("l0k_pair");
    l0kPairContract = contractFactory.getContractAt(pairContractAddress);
  });

  it("Test mint", async function () {
    const hash = await account0.invoke(l0kPairContract, "mint", {
      to: account0.address,
    });
    console.warn("hash: ", hash);

    const receipt = starknet.getTransactionReceipt(hash);

    console.warn("receipt:", receipt);
  });
});
