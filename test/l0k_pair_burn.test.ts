import { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract
} from "hardhat/types";
import { ensureEnvVar, envAccountOZ } from "./util";

describe("Amm pair", function () {
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

  it("Test burn", async function () {
    const { balance: accountLiquidity } = await l0kPairContract.call(
      "balanceOf",
      {
        account: account0.address,
      }
    );
    console.warn("accountLiquidity: ", accountLiquidity);

    const tHash = await account0.invoke(l0kPairContract, "transfer", {
      recipient: l0kPairContract.address,
      amount: accountLiquidity,
    });
    console.log("tHash:", tHash);

    const { balance: pairLiquidity } = await l0kPairContract.call("balanceOf", {
      account: l0kPairContract.address,
    });
    console.warn("pairLiquidity: ", pairLiquidity);

    const bHash = await account0.invoke(l0kPairContract, "burn", {
      to: account0.address,
    });
    console.log("bHash:", bHash);

    await accountTokenAB();

    // expect(uint256ToBN(balanceOfAccount).toNumber()).to.gt(0);
  });
});
