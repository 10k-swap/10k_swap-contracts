import { expect } from "chai";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import { ensureEnvVar, envAccountOZ, hardhatCompile } from "./util";

describe("Amm router", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");

  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");
  const FACTORY_CONTRACT_ADDRESS = ensureEnvVar("FACTORY_CONTRACT_ADDRESS");

  let l0kRouterContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
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
    const erc20ContractFactory = await starknet.getContractFactory("l0k_erc20");
    tokenAContract = erc20ContractFactory.getContractAt(TOKEN_A);
    tokenBContract = erc20ContractFactory.getContractAt(TOKEN_B);

    console.log("l0kRouterContract.address:", l0kRouterContract.address);
  });

  it("Test addLiquidity", async function () {
    const amountA = bnToUint256(1000000);
    const amountB = bnToUint256(100000);

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: { spender: l0kRouterContract.address, amount: amountA },
      },
      {
        toContract: tokenBContract,
        functionName: "approve",
        calldata: { spender: l0kRouterContract.address, amount: amountB },
      },
      {
        toContract: l0kRouterContract,
        functionName: "addLiquidity",
        calldata: {
          tokenA: TOKEN_A,
          tokenB: TOKEN_B,
          amountADesired: amountA,
          amountBDesired: amountB,
          amountAMin: amountA,
          amountBMin: amountB,
          to: account0.address,
          deadline: 3000000000,
        },
      },
    ];

    const hash = await account0.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    console.warn("hash:", hash);

    // const contractFactory = await starknet.getContractFactory("l0k_router");
    // const pairContractClassHash = await contractFactory.declare();
    // console.log("pairContractClassHash: ", pairContractClassHash);
    // expect(pairContractClassHash).to.not.equal(BigInt(0));
  });
});
