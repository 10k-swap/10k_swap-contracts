import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import { ensureEnvVar, envAccountOZ } from "./util";

describe("Amm pair swap", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_ADDRESS = ensureEnvVar("PAIR_CONTRACT_ADDRESS");

  let l0kPairContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
  let account0: OpenZeppelinAccount;
  let account1: OpenZeppelinAccount;

  async function accountTokenAB() {
    const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
      account: account1.address,
    });
    const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
      account: account1.address,
    });
    console.warn("account1.balanceTokenA:", balanceTokenA);
    console.warn("account1.balanceTokenB:", balanceTokenB);
  }

  before(async function () {
    // Compile on ./l0k_pair.declare.test.ts
    // await hardhat.run("starknet-compile", {
    //   paths: ["contracts/l0k_pair.cairo"],
    // });

    account0 = await envAccountOZ(0);
    account1 = await envAccountOZ(1);

    const contractFactory = await starknet.getContractFactory("l0k_pair");
    const erc20ContractFactory = await starknet.getContractFactory("l0k_erc20");
    l0kPairContract = contractFactory.getContractAt(PAIR_CONTRACT_ADDRESS);
    tokenAContract = erc20ContractFactory.getContractAt(TOKEN_A);
    tokenBContract = erc20ContractFactory.getContractAt(TOKEN_B);

    await accountTokenAB();
  });

  it("Test swap exception", async function () {
    try {
      await account1.invoke(l0kPairContract, "swap", {
        amount0Out: bnToUint256(0),
        amount1Out: bnToUint256(0),
        to: account1.address,
      });
    } catch (e: any) {
      expect(/10kSwap: IOA/i.test(e.message)).to.be.true;
    }

    try {
      await account1.invoke(l0kPairContract, "swap", {
        amount0Out: bnToUint256(20000000),
        amount1Out: bnToUint256(0),
        to: tokenAContract.address,
      });
    } catch (e: any) {
      expect(/10kSwap: IL/i.test(e.message)).to.be.true;
    }

    const amount0Out = bnToUint256(200);
    const amount1Out = bnToUint256(0);

    try {
      await account1.invoke(l0kPairContract, "swap", {
        amount0Out,
        amount1Out,
        to: tokenAContract.address,
      });
    } catch (e: any) {
      expect(/10kSwap: IT/i.test(e.message)).to.be.true;
    }
    try {
      await account1.invoke(l0kPairContract, "swap", {
        amount0Out,
        amount1Out,
        to: tokenBContract.address,
      });
    } catch (e: any) {
      expect(/10kSwap: IT/i.test(e.message)).to.be.true;
    }
  });

  it("Test swap", async function () {
    const amount0Out = bnToUint256(200);
    const amount1Out = bnToUint256(0);

    await account1.invoke(l0kPairContract, "swap", {
      amount0Out,
      amount1Out,
      to: tokenAContract.address,
    });
  });
});
