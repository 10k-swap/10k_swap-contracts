import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { hardhatCompile } from "./util";

describe("Amm pair", function () {
  let testHelperContract: StarknetContract;

  before(async function () {
    await hardhatCompile("contracts/tests/test_helper.cairo");

    const contractFactory = await starknet.getContractFactory(
      "contracts/tests/test_helper"
    );
    testHelperContract = await contractFactory.deploy();
  });

  it("Test test_felt_to_uint256", async function () {
    const { value } = await testHelperContract.call("test_felt_to_uint256", {
      low: 99,
    });
    console.warn(value);
  });
});
