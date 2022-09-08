import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract,
  StarknetContractFactory
} from "hardhat/types";
import JSBI from "jsbi";
import { toFelt } from "starknet/dist/utils/number";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import SwapExactTokensForTokensCheckers from "./router/SwapExactTokensForTokensCheckers";
import {
  computePairAddress,
  ensureEnvVar,
  envAccountOZ,
  expandTo18Decimals,
  getTokenBalances,
  getPairAmounts
} from "./util";

describe("Amm router", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");
  const FACTORY_CONTRACT_ADDRESS = ensureEnvVar("FACTORY_CONTRACT_ADDRESS");

  let l0kPairContractFactory: StarknetContractFactory;
  let l0kRouterContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
  let account0: OpenZeppelinAccount;
  let account1: OpenZeppelinAccount;

  function getDeadline() {
    return parseInt(new Date().getTime() / 1000 + "") + 30000;
  }

  before(async function () {
    // await hardhat.run("starknet-compile", {
    //   paths: ["contracts/l0k_router.cairo"],
    // });

    account0 = await envAccountOZ(0);
    account1 = await envAccountOZ(1);

    l0kPairContractFactory = await starknet.getContractFactory("l0k_pair");
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

  it("Test swapExactTokensForTokens", async function () {
    const pair = computePairAddress(
      FACTORY_CONTRACT_ADDRESS,
      PAIR_CONTRACT_CLASS_HASH,
      TOKEN_A,
      TOKEN_B
    );
    const l0kPairContract = l0kPairContractFactory.getContractAt(pair);

    const [
      { reserve0: reserve0Before, reserve1: reserve1Before },
      { balanceTokenA: balanceTokenABefore, balanceTokenB: balanceTokenBBefore }
    ] = await Promise.all([
      getPairAmounts({ l0kPairContract }),
      getTokenBalances(account0, [tokenAContract, tokenBContract])
    ])

    const inAmountA = expandTo18Decimals(100);
    const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];
    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(inAmountA.toString()),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "swapExactTokensForTokens",
        calldata: {
          amountIn: bnToUint256(inAmountA.toString()),
          amountOutMin: bnToUint256(0),
          path,
          to: account1.address,
          deadline: getDeadline(),
        },
      },
    ];

    await account1.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const [
      { reserve0, reserve1 },
      { balanceTokenA, balanceTokenB }
    ] = await Promise.all([
      getPairAmounts({ l0kPairContract }),
      getTokenBalances(account0, [tokenAContract, tokenBContract])
    ])

    const swapCheckers = new SwapExactTokensForTokensCheckers({
      balancesesA: [balanceTokenABefore, balanceTokenA],
      balancesesB: [balanceTokenBBefore, balanceTokenB],
      reserveses0: [reserve0Before, reserve0],
      reserveses1: [reserve1Before, reserve1],
      amountAToSwap: inAmountA.toString()
    })

    // const debitAmountA = JSBI.subtract(JSBI.BigInt(balanceTokenABefore), JSBI.BigInt(balanceTokenA))
    // const getAmountB = JSBI.subtract(JSBI.BigInt(balanceTokenBBefore), JSBI.BigInt(balanceTokenB))
    console.log(balanceTokenABefore.toString(), balanceTokenA.toString())
    console.log(balanceTokenBBefore.toString(), balanceTokenB.toString())
    console.log(reserve0Before.toString(), reserve0.toString())
    console.log(reserve1Before.toString(), reserve1.toString())
    // expect(swapCheckers.checkPairReserves()).to.be.true;

    expect(swapCheckers.checkUserBalances()).to.be.true;

  });

  // it("Test swapExactTokensForTokensSupportingFeeOnTransferTokens", async function () {

  //   const inAmount = expandTo18Decimals(100);

  //   const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];

  //   const invokeArray = [
  //     {
  //       toContract: tokenAContract,
  //       functionName: "approve",
  //       calldata: {
  //         spender: l0kRouterContract.address,
  //         amount: bnToUint256(inAmount.toString()),
  //       },
  //     },
  //     {
  //       toContract: l0kRouterContract,
  //       functionName: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
  //       calldata: {
  //         amountIn: bnToUint256(inAmount.toString()),
  //         amountOutMin: bnToUint256(0),
  //         path,
  //         to: account1.address,
  //         deadline: getDeadline(),
  //       },
  //     },
  //   ];

  //   await account1.multiInvoke(invokeArray, { maxFee: MAX_FEE });

  // });
});
