import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types";
import { ensureEnvVar, envAccountOZ, hardhatCompile } from "./util";

describe("Amm router", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");

  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");
  const FACTORY_CONTRACT_ADDRESS = ensureEnvVar("FACTORY_CONTRACT_ADDRESS");

  let l0kRouterContract: StarknetContract;
  let account0: OpenZeppelinAccount;
  let account1: OpenZeppelinAccount;
  let token0: string;
  let token1: string;
  let pair0Address: string;
  let pairLength = 0;

  before(async function () {
    await hardhatCompile("contracts/l0k_router.cairo");

    account0 = await envAccountOZ(0);
    account1 = await envAccountOZ(1);

    const contractFactory = await starknet.getContractFactory("l0k_router");
    l0kRouterContract = await contractFactory.deploy({
      factory: FACTORY_CONTRACT_ADDRESS,
      pairClass: PAIR_CONTRACT_CLASS_HASH,
    });

    console.log("l0kRouterContract.address:", l0kRouterContract.address);
  });

  it("Test addLiquidity", async function () {
    // const contractFactory = await starknet.getContractFactory("l0k_router");
    // const pairContractClassHash = await contractFactory.declare();
    // console.log("pairContractClassHash: ", pairContractClassHash);
    // expect(pairContractClassHash).to.not.equal(BigInt(0));
  });
});
