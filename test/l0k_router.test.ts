import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract,
  StarknetContractFactory
} from "hardhat/types";
import { toBN, toFelt } from "starknet/dist/utils/number";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import {
  computePairAddress,
  ensureEnvVar,
  envAccountOZ,
  expandTo18Decimals
} from "./util";

async function getAmounts({ l0kPairContract }: { l0kPairContract: StarknetContract }) {
  try {
    const [{ reserve0, reserve1 }] = await Promise.all([
      l0kPairContract.call('getReserves')
    ])
    return {
      reserve0: (reserve0).toString(),
      reserve1: (reserve1).toString(),
    }
  } catch (error) {
    return {
      reserve0: '0',
      reserve1: '0',
    }
  }
}

async function accountTokenAB(account: OpenZeppelinAccount, [tokenAContract, tokenBContract]: [StarknetContract, StarknetContract]) {
  const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
    account: account.address,
  });
  const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
    account: account.address,
  });
  return { balanceTokenA, balanceTokenB };
}

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

    const { balanceTokenA, balanceTokenB } = await accountTokenAB(account1, [tokenAContract, tokenBContract]);
    console.log("balanceTokenABefore:", uint256ToBN(balanceTokenA).toString());
    console.log("balanceTokenBBefore:", uint256ToBN(balanceTokenB).toString());

    {
      const { reserve0, reserve1 } = await getAmounts({ l0kPairContract })
      console.log("reserve0Before:", (reserve0).toString());
      console.log("reserve1Before:", (reserve1).toString());
    }

    const inAmount = expandTo18Decimals(100);
    const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];
    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(inAmount.toString()),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "swapExactTokensForTokens",
        calldata: {
          amountIn: bnToUint256(inAmount.toString()),
          amountOutMin: bnToUint256(0),
          path,
          to: account1.address,
          deadline: getDeadline(),
        },
      },
    ];

    await account1.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const { balanceTokenA: swapedBalanceTokenA, balanceTokenB: swapedBalanceTokenB } = await accountTokenAB(account1, [tokenAContract, tokenBContract]);
    console.log("balanceTokenAAfter:", uint256ToBN(swapedBalanceTokenA).toString());
    console.log("balanceTokenBAfter:", uint256ToBN(swapedBalanceTokenB).toString());
    {
      const { reserve0, reserve1 } = await getAmounts({ l0kPairContract })
      console.log("reserve0Before:", (reserve0).toString());
      console.log("reserve1Before:", (reserve1).toString());
    }

    expect(
      uint256ToBN(balanceTokenA).sub(toBN(inAmount.toString())).eq(uint256ToBN(swapedBalanceTokenA))
    ).to.be.true;

    expect(
      uint256ToBN(swapedBalanceTokenB).gt(uint256ToBN(balanceTokenB))
    ).to.be.true;

  });

  it("Test swapExactTokensForTokensSupportingFeeOnTransferTokens", async function () {
    const {
      balanceTokenA: balanceTokenABefore,
      balanceTokenB: balanceTokenBBefore,
    } = await accountTokenAB(account1, [tokenAContract, tokenBContract]);

    const inAmount = expandTo18Decimals(100);

    const path = [toFelt(TOKEN_A), toFelt(TOKEN_B)];

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(inAmount.toString()),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        calldata: {
          amountIn: bnToUint256(inAmount.toString()),
          amountOutMin: bnToUint256(0),
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
    } = await accountTokenAB(account1, [tokenAContract, tokenBContract]);

    expect(uint256ToBN(balanceTokenABefore).gt(uint256ToBN(balanceTokenAAfter)))
      .to.be.true;
    expect(uint256ToBN(balanceTokenBBefore).gt(uint256ToBN(balanceTokenBAfter)))
      .to.be.false;
  });
});
