import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types";
import { toBN, toHex } from "starknet/dist/utils/number";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { ensureEnvVar } from "./util";

describe("Test l0k_library", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");
  const FACTORY_CONTRACT_ADDRESS = ensureEnvVar("FACTORY_CONTRACT_ADDRESS");
  const PAIR_CONTRACT_ADDRESS = ensureEnvVar("PAIR_CONTRACT_ADDRESS");

  let testl0kLibraryContract: StarknetContract;

  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/tests/test_l0k_library.cairo"],
    });

    const contractFactory = await starknet.getContractFactory(
      "contracts/tests/test_l0k_library"
    );
    testl0kLibraryContract = await contractFactory.deploy();
  });

  it("Test test_pairFor", async function () {
    const { res } = await testl0kLibraryContract.call("test_pairFor", {
      factory: FACTORY_CONTRACT_ADDRESS,
      pairClass: PAIR_CONTRACT_CLASS_HASH,
      tokenA: TOKEN_A,
      tokenB: TOKEN_B,
    });

    console.log("PAIR_CONTRACT_ADDRESS:", PAIR_CONTRACT_ADDRESS);
    expect(toHex(toBN(res))).to.equal(PAIR_CONTRACT_ADDRESS);
  });

  it("Test test_quote", async function () {
    const amountA = bnToUint256(200000),
      reserveA = 20000,
      reserveB = 2000;

    const { amountB } = await testl0kLibraryContract.call("test_quote", {
      amountA,
      reserveA,
      reserveB,
    });

    console.warn("amountB: ", amountB);

    // expect(toHex(toBN(res))).to.equal(PAIR_CONTRACT_ADDRESS);
  });
});
