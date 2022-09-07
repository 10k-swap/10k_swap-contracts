import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import {
  OpenZeppelinAccount,
  StarknetContract,
  StarknetContractFactory
} from "hardhat/types";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import AddLiquidityCheckers from "./router/AddLiquidityCheckers";
import {
  computePairAddress,
  ensureEnvVar,
  envAccountOZ,
  expandTo18Decimals
} from "./util";

async function getAmounts({ l0kPairContract }: { l0kPairContract: StarknetContract }) {
  try {
    const [{ totalSupply }, { reserve0, reserve1 }] = await Promise.all([
      l0kPairContract.call("totalSupply"),
      l0kPairContract.call('getReserves')
    ])
    return {
      totalSupply: uint256ToBN(totalSupply).toString(),
      reserve0: (reserve0).toString(),
      reserve1: (reserve1).toString(),
    }
  } catch (error) {
    return {
      totalSupply: '0',
      reserve0: '0',
      reserve1: '0',
    }
  }
}

async function getLPBalance(account: OpenZeppelinAccount, l0kPairContract: StarknetContract) {
  try {
    const { balance } = await l0kPairContract.call(
      "balanceOf",
      { account: account.address, }
    );
    return uint256ToBN(balance).toString()
  } catch (err) {
    return '0'
  }
}

async function accountTokenAB(account: OpenZeppelinAccount, [tokenAContract, tokenBContract]: [StarknetContract, StarknetContract]) {
  const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
    account: account.address,
  });
  const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
    account: account.address,
  });
  return {
    balanceTokenA: uint256ToBN(balanceTokenA).toString(),
    balanceTokenB: uint256ToBN(balanceTokenB).toString()
  };
}

describe("Amm router ", function () {
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

  it("Test addLiquidity", async function () {
    const pair = computePairAddress(
      FACTORY_CONTRACT_ADDRESS,
      PAIR_CONTRACT_CLASS_HASH,
      TOKEN_A,
      TOKEN_B
    );
    const l0kPairContract = l0kPairContractFactory.getContractAt(pair);

    const [
      userLPBalanceBefore,
      { totalSupply: totalSupplyBefore, reserve0: reserve0Before, reserve1: reserve1Before },
      { balanceTokenA: balanceTokenABefore, balanceTokenB: balanceTokenBBefore }
    ] = await Promise.all([
      getLPBalance(account0, l0kPairContract),
      getAmounts({ l0kPairContract }),
      accountTokenAB(account0, [tokenAContract, tokenBContract])
    ])

    const amountA = expandTo18Decimals(1000);
    const amountB = expandTo18Decimals(1000);

    const invokeArray = [
      {
        toContract: tokenAContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(amountA.toString()),
        },
      },
      {
        toContract: tokenBContract,
        functionName: "approve",
        calldata: {
          spender: l0kRouterContract.address,
          amount: bnToUint256(amountB.toString()),
        },
      },
      {
        toContract: l0kRouterContract,
        functionName: "addLiquidity",
        calldata: {
          tokenA: TOKEN_A,
          tokenB: TOKEN_B,
          amountADesired: bnToUint256(amountA.toString()),
          amountBDesired: bnToUint256(amountB.toString()),
          amountAMin: bnToUint256(0),
          amountBMin: bnToUint256(0),
          to: account0.address,
          deadline: getDeadline(),
        },
      },
    ];
    await account0.multiInvoke(invokeArray, { maxFee: MAX_FEE });

    const [
      balance,
      { totalSupply, reserve0, reserve1 },
      { balanceTokenA, balanceTokenB }
    ] = await Promise.all([
      getLPBalance(account0, l0kPairContract),
      getAmounts({ l0kPairContract }),
      accountTokenAB(account0, [tokenAContract, tokenBContract])
    ])

    const addLiquidityCheckers = new AddLiquidityCheckers({
      userLPs: [userLPBalanceBefore, balance],
      LPTotalSupplys: [totalSupplyBefore, totalSupply],
      balancesesA: [balanceTokenABefore, balanceTokenA],
      balancesesB: [balanceTokenBBefore, balanceTokenB],
      reserveses0: [reserve0Before, reserve0],
      reserveses1: [reserve1Before, reserve1],
      amountsToAdd: [amountA.toString(), amountB.toString()]
    })

    expect(addLiquidityCheckers.checkLPtotalSupply()).to.be.true;

    expect(addLiquidityCheckers.checkUserLPBalance()).to.be.true;

    expect(addLiquidityCheckers.checkPairReserves()).to.be.true;

    expect(addLiquidityCheckers.checkUserBalances()).to.be.true;
  });

  // it("Reomve Liquidity", async function () {
  //   const pair = computePairAddress(
  //     FACTORY_CONTRACT_ADDRESS,
  //     PAIR_CONTRACT_CLASS_HASH,
  //     TOKEN_A,
  //     TOKEN_B
  //   );
  //   const l0kPairContract = l0kPairContractFactory.getContractAt(pair);
  //   const amountRemove = expandTo18Decimals(10);

  //   const { balance: balanceLiquidityBefore } = await l0kPairContract.call(
  //     "balanceOf",
  //     { account: account0.address, }
  //   );
  //   console.log("LiquidityReomveBeforeBalance:", uint256ToBN(balanceLiquidityBefore).toString());
  //   {
  //     const { balanceTokenA, balanceTokenB } = await accountTokenAB(account0, [tokenAContract, tokenBContract])
  //     console.log("ReomveBeforeUserBalanceA:", balanceTokenA);
  //     console.log("ReomveBeforeUserBalanceB:", balanceTokenB);
  //   }
  //   {
  //     const { totalSupply, reserve0, reserve1 } = await getAmounts({ l0kPairContract })
  //     console.log("LPtotalSupplyBefore:", (totalSupply).toString());
  //     console.log("reserve0Before:", (reserve0).toString());
  //     console.log("reserve1Before:", (reserve1).toString());
  //   }
  //   const invokeArray = [
  //     {
  //       toContract: l0kPairContract,
  //       functionName: "approve",
  //       calldata: {
  //         spender: l0kRouterContract.address,
  //         amount: bnToUint256(amountRemove.toString()),
  //       },
  //     },
  //     {
  //       toContract: l0kRouterContract,
  //       functionName: "removeLiquidity",
  //       calldata: {
  //         tokenA: TOKEN_A,
  //         tokenB: TOKEN_B,
  //         liquidity: bnToUint256(amountRemove.toString()),
  //         amountAMin: bnToUint256(0),
  //         amountBMin: bnToUint256(0),
  //         to: account0.address,
  //         deadline: getDeadline(),
  //       },
  //     },
  //   ];

  //   await account0.multiInvoke(invokeArray, { maxFee: MAX_FEE });

  //   const { balance: balanceAfter } = await l0kPairContract.call("balanceOf", {
  //     account: account0.address,
  //   });

  //   console.log("LiquidityReomveAfterBalance:", uint256ToBN(balanceAfter).toString());

  //   {
  //     const { balanceTokenA, balanceTokenB } = await accountTokenAB(account0, [tokenAContract, tokenBContract])
  //     console.log("ReomveAfterBalanceA:", balanceTokenA);
  //     console.log("ReomveAfterBalanceB:", balanceTokenB);
  //   }
  //   {
  //     const { totalSupply, reserve0, reserve1 } = await getAmounts({ l0kPairContract })
  //     console.log("LPtotalSupplyAfter:", (totalSupply).toString());
  //     console.log("reserve0After:", (reserve0).toString());
  //     console.log("reserve1After:", (reserve1).toString());
  //   }
  // });
});
