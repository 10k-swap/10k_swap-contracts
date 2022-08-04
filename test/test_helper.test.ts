import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { hardhatCompile } from "./util";

describe("Test helper", function () {
  let testHelperContract: StarknetContract;

  before(async function () {
    await hardhatCompile("contracts/tests/test_helper.cairo");

    const contractFactory = await starknet.getContractFactory(
      "contracts/tests/test_helper"
    );
    testHelperContract = await contractFactory.deploy();
  });

  it("Test test_uint256_sub", async function () {
    const a = bnToUint256(1);
    const b = bnToUint256(2);
    const { res } = await testHelperContract.call("test_uint256_sub", {
      a,
      b,
    });
    console.warn("res:", res);
  });

  it("Test test_oz_sub_le", async function () {
    const a = bnToUint256(2);
    const b = bnToUint256(2);
    const { res } = await testHelperContract.call("test_oz_sub_le", {
      a,
      b,
    });
    console.warn("res:", res);
  });

  it("Test test_oz_sub_lt", async function () {
    try {
      const a = bnToUint256(2);
      const b = bnToUint256(2);
      const { res } = await testHelperContract.call("test_oz_sub_lt", {
        a,
        b,
      });
    } catch (err: any) {
      console.error("e:", err.message);
    }
  });

  it("Test test_mul_and_sqrt", async function () {
    try {
      const amount0 = bnToUint256(1000);
      const amount1 = bnToUint256(1000);
      const { res } = await testHelperContract.call("test_mul_and_sqrt", {
        amount0,
        amount1,
      });

      console.warn("res:", res);
    } catch (err: any) {
      console.error("e:", err.message);
    }
  });

  it("Test test_uint256_le", async function () {
    const a = bnToUint256(1000);
    const b = bnToUint256(1000);
    const { res } = await testHelperContract.call("test_uint256_le", {
      a,
      b,
    });

    console.warn("res:", res);
  });

  it("Test test_uint256_lt", async function () {
    const a = bnToUint256(1000);
    const b = bnToUint256(1000);
    const { res } = await testHelperContract.call("test_uint256_lt", {
      a,
      b,
    });

    console.warn("res:", res);
  });

  it("Test test_SafeUint256_mul", async function () {
    const a = bnToUint256(2);
    const b = bnToUint256(4);

    const { res } = await testHelperContract.call("test_SafeUint256_mul", { a, b });

    console.warn("res:", res);
  });
});
