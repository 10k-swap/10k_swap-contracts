import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { hardhatCompile } from "./util";

describe("Amm pair", function () {
  let pairContractAddress: string;
  let l0kPairContract: StarknetContract;

  before(async function () {
    // Compile on ./l0k_pair.declare.test.ts
    // await hardhatCompile("contracts/l0k_pair.cairo");

    pairContractAddress = <string>process.env.PAIR_CONTRACT_ADDRESS;
    const contractFactory = await starknet.getContractFactory("l0k_pair");
    l0kPairContract = contractFactory.getContractAt(pairContractAddress);
  });

  it("Test ooo", async function () {
    
  });
});
