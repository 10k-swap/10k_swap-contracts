import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types/runtime";
import { shortString } from "starknet";
import { computeHashOnElements, pedersen } from "starknet/dist/utils/hash";
import { MAX_FEE } from "./constants";
import {
  computePairAddress,
  ensureEnvVar,
  envAccountOZ,
  hardhatCompile,
} from "./util";

describe("Amm factory", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");

  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");

  let l0kFactoryContract: StarknetContract;
  let accountOZ0: OpenZeppelinAccount;
  let accountOZ1: OpenZeppelinAccount;
  let token0: string;
  let token1: string;
  let pair0Address: string;
  let pairLength = 0;

  before(async function () {
    await hardhatCompile("contracts/l0k_factory.cairo");

    accountOZ0 = await envAccountOZ(0);
    accountOZ1 = await envAccountOZ(1);

    const contractFactory = await starknet.getContractFactory("l0k_factory");
    l0kFactoryContract = await contractFactory.deploy({
      pairClass: PAIR_CONTRACT_CLASS_HASH,
      feeToSetter: accountOZ0.address,
    });
    console.log("l0kFactoryContract.address: ", l0kFactoryContract.address);
  });

  it("Test feeTo and feeToSetter", async function () {
    await accountOZ0.invoke(
      l0kFactoryContract,
      "setFeeToSetter",
      { feeToSetter: accountOZ1.address },
      { maxFee: MAX_FEE }
    );
    const { feeToSetter } = await l0kFactoryContract.call("feeToSetter");
    expect(feeToSetter).to.deep.equal(BigInt(accountOZ1.address));

    await accountOZ1.invoke(
      l0kFactoryContract,
      "setFeeTo",
      { feeTo: accountOZ1.address },
      { maxFee: MAX_FEE }
    );
    const { feeTo } = await l0kFactoryContract.call("feeTo");
    console.log("feeTo:", feeTo);
    expect(feeTo).to.deep.equal(BigInt(accountOZ1.address));
  });

  it("Test createPair", async function () {
    const hash = await l0kFactoryContract.invoke(
      "createPair",
      { tokenA: TOKEN_A, tokenB: TOKEN_B },
      { maxFee: MAX_FEE }
    );
    const receipt = await starknet.getTransactionReceipt(hash);
    const event0 = receipt.events[0];
    token0 = event0.data[0];
    token1 = event0.data[1];

    pair0Address = computePairAddress(
      l0kFactoryContract.address,
      PAIR_CONTRACT_CLASS_HASH,
      TOKEN_A,
      TOKEN_B
    );
    console.log("pair0Address:", pair0Address);

    expect(BigInt(token0)).to.equal(
      BigInt(TOKEN_B > TOKEN_A ? TOKEN_A : TOKEN_B)
    );
    expect(BigInt(token1)).to.equal(
      BigInt(TOKEN_B > TOKEN_A ? TOKEN_B : TOKEN_A)
    );
    expect(BigInt(event0.data[2])).to.equal(BigInt(pair0Address));

    const { pair } = await l0kFactoryContract.call("getPair", {
      token0: TOKEN_A,
      token1: TOKEN_B,
    });

    expect(BigInt(pair)).to.equal(BigInt(pair0Address));

    pairLength += 1;
  });

  it("Test getPair & allPairs & allPairsLength", async function () {
    const { pair } = await l0kFactoryContract.call("getPair", {
      token0,
      token1,
    });

    const { pair: allPairs0 } = await l0kFactoryContract.call("allPairs", {
      index: pairLength - 1,
    });
    const { length } = await l0kFactoryContract.call("allPairsLength");

    expect(BigInt(pair)).to.equal(BigInt(pair0Address));
    expect(BigInt(allPairs0)).to.equal(BigInt(pair0Address));
    expect(BigInt(length)).to.equal(BigInt(pairLength));
  });

  it("Test pair factory & token0 & token1", async function () {
    const contractFactory = await starknet.getContractFactory("l0k_pair");
    const pairContract = contractFactory.getContractAt(pair0Address);

    const { factory } = await pairContract.call("factory");
    const { token0: _token0 } = await pairContract.call("token0");
    const { token1: _token1 } = await pairContract.call("token1");

    expect(BigInt(factory)).to.equal(BigInt(l0kFactoryContract.address));
    expect(BigInt(token0)).to.equal(BigInt(_token0));
    expect(BigInt(token1)).to.equal(BigInt(_token1));
  });
});
