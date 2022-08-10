import { expect } from "chai";
import { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract,
  StarknetContractFactory,
} from "hardhat/types";
import { ContractFactory } from "starknet";
import { toFelt } from "starknet/dist/utils/number";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import {
  computePairAddress,
  ensureEnvVar,
  envAccountOZ,
  hardhatCompile,
} from "./util";

describe("Amm router", function () {
  const TOKEN_A = ensureEnvVar("TOKEN_A");
  const TOKEN_B = ensureEnvVar("TOKEN_B");
  const PAIR_CONTRACT_CLASS_HASH = ensureEnvVar("PAIR_CONTRACT_CLASS_HASH");
  const FACTORY_CONTRACT_ADDRESS = ensureEnvVar("FACTORY_CONTRACT_ADDRESS");

  const AB_SCALE = 10;

  let l0kPairContractFactory: StarknetContractFactory;
  let l0kRouterContract: StarknetContract;
  let tokenAContract: StarknetContract;
  let tokenBContract: StarknetContract;
  let account0: OpenZeppelinAccount;
  let account1: OpenZeppelinAccount;
  let token0: string;
  let token1: string;
  let pair0Address: string;
  let pairLength = 0;

  function getDeadline() {
    return parseInt(new Date().getTime() / 1000 + "") + 30000;
  }

  async function accountTokenAB(account: OpenZeppelinAccount) {
    const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
      account: account.address,
    });
    const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
      account: account.address,
    });
    console.warn("balanceTokenA:", balanceTokenA);
    console.warn("balanceTokenB:", balanceTokenB);
    return { balanceTokenA, balanceTokenB };
  }

  before(async function () {
    await hardhatCompile("contracts/l0k_router.cairo");

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

  // it("Test addLiquidity", async function () {
  //   const pair = computePairAddress(
  //     FACTORY_CONTRACT_ADDRESS,
  //     PAIR_CONTRACT_CLASS_HASH,
  //     TOKEN_A,
  //     TOKEN_B
  //   );
  //   const l0kPairContract = l0kPairContractFactory.getContractAt(pair);

  //   let balanceBefore = bnToUint256(0);
  //   try {
  //     const { balance: _balanceBefore } = await l0kPairContract.call(
  //       "balanceOf",
  //       {
  //         account: account0.address,
  //       }
  //     );
  //     balanceBefore = _balanceBefore;
  //   } catch (err) {}
  //   console.log("balanceBefore:", balanceBefore);

  //   const amountA = 1000000;
  //   const amountB = parseInt(amountA / AB_SCALE + "");

  //   const invokeArray = [
  //     {
  //       toContract: tokenAContract,
  //       functionName: "approve",
  //       calldata: {
  //         spender: l0kRouterContract.address,
  //         amount: bnToUint256(amountA),
  //       },
  //     },
  //     {
  //       toContract: tokenBContract,
  //       functionName: "approve",
  //       calldata: {
  //         spender: l0kRouterContract.address,
  //         amount: bnToUint256(amountB),
  //       },
  //     },
  //     {
  //       toContract: l0kRouterContract,
  //       functionName: "addLiquidity",
  //       calldata: {
  //         tokenA: TOKEN_A,
  //         tokenB: TOKEN_B,
  //         amountADesired: bnToUint256(amountA),
  //         amountBDesired: bnToUint256(amountB),
  //         amountAMin: bnToUint256((amountA * 8) / 10),
  //         amountBMin: bnToUint256((amountB * 8) / 10),
  //         to: account0.address,
  //         deadline: getDeadline(),
  //       },
  //     },
  //   ];

  //   await account0.multiInvoke(invokeArray, { maxFee: MAX_FEE });

  //   const { balance: balanceAfter } = await l0kPairContract.call("balanceOf", {
  //     account: account0.address,
  //   });
  //   console.log("balanceAfter:", balanceAfter);

  //   expect(uint256ToBN(balanceAfter).toNumber()).to.gt(
  //     uint256ToBN(balanceBefore).toNumber()
  //   );
  // });

  it("Test swapExactTokensForTokens", async function () {
    const {
      balanceTokenA: balanceTokenABefore,
      balanceTokenB: balanceTokenBBefore,
    } = await accountTokenAB(account1);

    const amountIn = 1000;
    const amountOutMin = parseInt(amountIn / AB_SCALE + "") - 20;

    const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(amountIn),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "swapExactTokensForTokens",
        calldata: {
          amountIn: bnToUint256(amountIn),
          amountOutMin: bnToUint256(amountOutMin),
          path,
          to: account1.address,
          deadline: getDeadline(),
        },
      },
    ];

    await account1.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const {
      balanceTokenA: balanceTokenAAfter,
      balanceTokenB: balanceTokenBAfter,
    } = await accountTokenAB(account1);

    expect(uint256ToBN(balanceTokenABefore).gt(uint256ToBN(balanceTokenAAfter)))
      .to.be.true;
    expect(uint256ToBN(balanceTokenBBefore).gt(uint256ToBN(balanceTokenBAfter)))
      .to.be.false;
  });

  it("Test swapExactTokensForTokensSupportingFeeOnTransferTokens", async function () {
    const {
      balanceTokenA: balanceTokenABefore,
      balanceTokenB: balanceTokenBBefore,
    } = await accountTokenAB(account1);

    const amountIn = 1000;
    const amountOutMin = parseInt(amountIn / AB_SCALE + "") - 20;

    const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(amountIn),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        calldata: {
          amountIn: bnToUint256(amountIn),
          amountOutMin: bnToUint256(amountOutMin),
          path,
          to: account1.address,
          deadline: getDeadline(),
        },
      },
    ];

    await account1.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const {
      balanceTokenA: balanceTokenAAfter,
      balanceTokenB: balanceTokenBAfter,
    } = await accountTokenAB(account1);

    expect(uint256ToBN(balanceTokenABefore).gt(uint256ToBN(balanceTokenAAfter)))
      .to.be.true;
    expect(uint256ToBN(balanceTokenBBefore).gt(uint256ToBN(balanceTokenBAfter)))
      .to.be.false;
  });
});
