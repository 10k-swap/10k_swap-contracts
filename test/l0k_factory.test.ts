import { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types/runtime";
import { expect } from "chai";
import { hardhatCompile } from "./util";
import { Provider } from "starknet";

describe("Amm sample", function () {
  let l0kFactoryContract: StarknetContract;

  before(async function () {
    await hardhatCompile("contracts/l0k_factory.cairo");

    // assumes contracts have been compiled
    const contractFactory = await starknet.getContractFactory("l0k_factory");
    l0kFactoryContract = await contractFactory.deploy();
    console.log("l0kFactoryContract.address: ", l0kFactoryContract.address);
  });

  it("T0", async function () {
    const createPairResp = await l0kFactoryContract.invoke("createPair", {
      tokenA: 1,
      tokenB: 2,
    });

    const feeTo = await l0kFactoryContract.call('feeTo')

    console.warn("feeTo:", feeTo);
  });
});
