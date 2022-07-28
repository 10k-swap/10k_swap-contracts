import { expect } from "chai";
import { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract,
  StarknetContractFactory,
} from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { ensureEnvVar, envAccountOZ, hardhatCompile } from "./util";

describe("Amm pair", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_ADDRESS = ensureEnvVar("PAIR_CONTRACT_ADDRESS");

  let l0kPairContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
  let account0: OpenZeppelinAccount;

  before(async function () {
    // Compile on ./l0k_pair.declare.test.ts
    // await hardhatCompile("contracts/l0k_pair.cairo");

    account0 = await envAccountOZ(0);

    const contractFactory = await starknet.getContractFactory("l0k_pair");
    const erc20ContractFactory = await starknet.getContractFactory("l0k_erc20");
    l0kPairContract = contractFactory.getContractAt(PAIR_CONTRACT_ADDRESS);
    tokenAContract = erc20ContractFactory.getContractAt(TOKEN_A);
    tokenBContract = erc20ContractFactory.getContractAt(TOKEN_B);
  });

  it("Test mint", async function () {
    const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
      account: account0.address,
    });
    const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
      account: account0.address,
    });
    console.warn("balanceTokenA:", balanceTokenA);
    console.warn("balanceTokenB:", balanceTokenB);

    const hash = await account0.invoke(l0kPairContract, "mint", {
      to: account0.address,
    });

    const receipt = await starknet.getTransactionReceipt(hash);
    console.warn("receipt:", receipt);

    const { balance: balanceOfZero } = await l0kPairContract.call("balanceOf", {
      account: 0,
    });
    expect(BigInt(uint256ToBN(balanceOfZero) + "")).to.equal(BigInt(1000));
  });
});
