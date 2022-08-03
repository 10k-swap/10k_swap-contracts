import { expect } from "chai";
import { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract
} from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import { ensureEnvVar, envAccountOZ } from "./util";

describe("Amm pair mint", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_ADDRESS = ensureEnvVar("PAIR_CONTRACT_ADDRESS");

  let l0kPairContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
  let account0: OpenZeppelinAccount;

  async function accountTokenAB() {
    const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
      account: account0.address,
    });
    const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
      account: account0.address,
    });
    console.warn("balanceTokenA:", balanceTokenA);
    console.warn("balanceTokenB:", balanceTokenB);
  }

  before(async function () {
    // Compile on ./l0k_pair.declare.test.ts
    // await hardhatCompile("contracts/l0k_pair.cairo");

    account0 = await envAccountOZ(0);

    const contractFactory = await starknet.getContractFactory("l0k_pair");
    const erc20ContractFactory = await starknet.getContractFactory("l0k_erc20");
    l0kPairContract = contractFactory.getContractAt(PAIR_CONTRACT_ADDRESS);
    tokenAContract = erc20ContractFactory.getContractAt(TOKEN_A);
    tokenBContract = erc20ContractFactory.getContractAt(TOKEN_B);

    await accountTokenAB();
  });

  it("Test mint", async function () {
    const amountA = bnToUint256(1000000);
    const amountB = bnToUint256(100000);

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "transfer",
        calldata: { recipient: PAIR_CONTRACT_ADDRESS, amount: amountA },
      },
      {
        toContract: tokenBContract,
        functionName: "transfer",
        calldata: { recipient: PAIR_CONTRACT_ADDRESS, amount: amountB },
      },
    ];
    await account0.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const { balance: pairBalanceA } = await tokenAContract.call("balanceOf", {
      account: PAIR_CONTRACT_ADDRESS,
    });
    const { balance: pairBalanceB } = await tokenBContract.call("balanceOf", {
      account: PAIR_CONTRACT_ADDRESS,
    });
    console.warn("pairBalanceA:", pairBalanceA);
    console.warn("pairBalanceB:", pairBalanceB);

    const hash = await account0.invoke(l0kPairContract, "mint", {
      to: account0.address,
    });

    const receipt = await starknet.getTransactionReceipt(hash);
    console.warn("receipt.events:", receipt.events);

    const { balance: balanceOfZero } = await l0kPairContract.call("balanceOf", {
      account: 0,
    });
    expect(BigInt(uint256ToBN(balanceOfZero) + "")).to.equal(BigInt(1000));

    const { balance: balanceOfAccount } = await l0kPairContract.call(
      "balanceOf",
      {
        account: account0.address,
      }
    );
    console.log("balanceOfAccount:", balanceOfAccount);
    expect(uint256ToBN(balanceOfAccount).toNumber()).to.gt(0);
  });
});
