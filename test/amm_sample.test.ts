import { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types/runtime";
import { expect } from "chai";
import { hardhatCompile } from "./util";

describe("Amm sample", function () {
  let ammSampleContract: StarknetContract;

  const TEST_ACCOUNT_01 = 1;

  const TOKEN_TYPE_A = 1;
  const TOKEN_TYPE_B = 2;

  before(async function () {
    await hardhatCompile("contracts/amm_sample.cairo");

    // assumes contracts have been compiled
    const contractFactory = await starknet.getContractFactory("amm_sample");
    ammSampleContract = await contractFactory.deploy();
    console.log("ammSampleContract.address: ", ammSampleContract.address);
  });

  describe("create pool", () => {
    it("init", async function () {
      const pool_token_a_balance = 10;
      const pool_token_b_balance = 100;

      await ammSampleContract.invoke("init_pool", {
        token_a: pool_token_a_balance,
        token_b: pool_token_b_balance,
      });

      {
        const { balance: balance_a } = await ammSampleContract.call("get_pool_token_balance", {
          token_type: TOKEN_TYPE_A,
        });
        expect(balance_a).to.equals(10n);
      }
      {
        const { balance: balance_b } = await ammSampleContract.call("get_pool_token_balance", {
          token_type: TOKEN_TYPE_B,
        });
        expect(balance_b).to.equals(100n);
      }
    });
  });

  describe("add demo token", () => {
    it("user balance", async function () {
      const user_token_a_balance = 10;
      const user_token_b_balance = 100;

      await ammSampleContract.invoke("add_demo_token", {
        account_id: TEST_ACCOUNT_01,
        token_a_amount: user_token_a_balance,
        token_b_amount: user_token_b_balance,
      });

      {
        const { balance: user_balance_a } = await ammSampleContract.call(
          "get_account_token_balance",
          {
            account_id: TEST_ACCOUNT_01,
            token_type: TOKEN_TYPE_A,
          }
        );
        expect(user_balance_a).to.equals(10n);
      }
      {
        const { balance: user_balance_b } = await ammSampleContract.call(
          "get_account_token_balance",
          {
            account_id: TEST_ACCOUNT_01,
            token_type: TOKEN_TYPE_B,
          }
        );
        expect(user_balance_b).to.equals(100n);
      }
    });
  });

  describe("swap", () => {
    it("check swap amounts", async function () {
      await ammSampleContract.invoke("swap", {
        account_id: TEST_ACCOUNT_01,
        token_from: TOKEN_TYPE_A,
        amount_from: 10,
      });

      {
        const { balance: user_balance_a } = await ammSampleContract.call(
          "get_account_token_balance",
          {
            account_id: TEST_ACCOUNT_01,
            token_type: TOKEN_TYPE_A,
          }
        );
        expect(user_balance_a).to.equals(0n);
      }
      {
        const { balance: user_balance_b } = await ammSampleContract.call(
          "get_account_token_balance",
          {
            account_id: TEST_ACCOUNT_01,
            token_type: TOKEN_TYPE_B,
          }
        );
        expect(user_balance_b).to.equals(150n);
      }

      {
        const { balance: pool_balance_a } = await ammSampleContract.call("get_pool_token_balance", {
          token_type: TOKEN_TYPE_A,
        });
        expect(pool_balance_a).to.equals(20n);
      }
      {
        const { balance: pool_balance_b } = await ammSampleContract.call("get_pool_token_balance", {
          token_type: TOKEN_TYPE_B,
        });
        expect(pool_balance_b).to.equals(50n);
      }
    });
  });
});
