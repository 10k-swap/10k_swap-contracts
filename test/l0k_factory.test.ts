import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types/runtime";
import { MAX_FEE } from "./constants";
import { envAccountOZ, hardhatCompile } from "./util";

describe("Amm sample", function () {
  let l0kFactoryContract: StarknetContract;
  let accountOZ0: OpenZeppelinAccount;
  let accountOZ1: OpenZeppelinAccount;

  before(async function () {
    await hardhatCompile("contracts/l0k_factory.cairo");

    accountOZ0 = await envAccountOZ(0);
    accountOZ1 = await envAccountOZ(1);

    const contractFactory = await starknet.getContractFactory("l0k_factory");
    l0kFactoryContract = await contractFactory.deploy({
      feeToSetter: accountOZ0.address,
    });
    console.log("l0kFactoryContract.address: ", l0kFactoryContract.address);
  });

  // it("Test feeTo and feeToSetter", async function () {
  //   await accountOZ0.invoke(
  //     l0kFactoryContract,
  //     "setFeeToSetter",
  //     { feeToSetter: accountOZ1.address },
  //     { maxFee: MAX_FEE }
  //   );
  //   const { feeToSetter } = await l0kFactoryContract.call("feeToSetter");
  //   expect(feeToSetter).to.deep.equal(BigInt(accountOZ1.address));

  //   await accountOZ1.invoke(
  //     l0kFactoryContract,
  //     "setFeeTo",
  //     { feeTo: accountOZ0.address },
  //     { maxFee: MAX_FEE }
  //   );
  //   const { feeTo } = await l0kFactoryContract.call("feeTo");
  //   expect(feeTo).to.deep.equal(BigInt(accountOZ0.address));
  // });

  it("Test createPair", async function () {
    const tokenA = 0xa,
      tokenB = 0xb;

    const hash = await l0kFactoryContract.invoke(
      "createPair",
      { tokenA, tokenB },
      { maxFee: MAX_FEE }
    );
    const receipt = await starknet.getTransactionReceipt(hash)
    console.warn('receipt::: ', receipt.events);
    

    const { pair } = await l0kFactoryContract.call("getPair", {
      token0: tokenA,
      token1: tokenB,
    });

    expect(pair).to.not.equal(BigInt(0));
  });
});
