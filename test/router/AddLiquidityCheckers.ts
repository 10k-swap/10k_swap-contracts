import JSBI from "jsbi"
import { MINIMUM_LIQUIDITY, ONE, THREE, TWO, ZERO } from "./constants"

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

function getLiquidityMinted(totalSupply: string, tokenAmounts: [string, string], reserves: [string, string]): string | undefined {
  let liquidity: JSBI
  if (JSBI.equal(JSBI.BigInt(totalSupply), ZERO)) {
    liquidity = JSBI.subtract(sqrt(JSBI.multiply(JSBI.BigInt(tokenAmounts[0]), JSBI.BigInt(tokenAmounts[1]))), MINIMUM_LIQUIDITY)
  } else {
    const amount0 = JSBI.divide(JSBI.multiply(JSBI.BigInt(tokenAmounts[0]), JSBI.BigInt(totalSupply)), JSBI.BigInt(reserves[0]))
    const amount1 = JSBI.divide(JSBI.multiply(JSBI.BigInt(tokenAmounts[1]), JSBI.BigInt(totalSupply)), JSBI.BigInt(reserves[1]))
    liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
  }
  if (!JSBI.greaterThan(liquidity, ZERO)) {
    return undefined
  }
  return liquidity.toString()
}

export default class AddLiquidityCheckers {
  private amounts: {
    // [before,after]
    userLPs: [string, string],
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    LPTotalSupplys: [string, string],
    // [A,B]
    amountsToAdd: [string, string]
  }

  constructor(amounts: {
    userLPs: [string, string],
    LPTotalSupplys: [string, string],
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountsToAdd: [string, string]
  }) {
    this.amounts = amounts
  }

  checkUserLPBalance(): boolean {
    const { LPTotalSupplys, amountsToAdd, reserveses0, reserveses1, userLPs } = this.amounts
    const liquidityMinted = getLiquidityMinted(LPTotalSupplys[0], amountsToAdd, [
      reserveses0[0],
      reserveses1[0]
    ])
    if (liquidityMinted) {
      const amount = JSBI.subtract(JSBI.BigInt(userLPs[1]), JSBI.BigInt(userLPs[0]))
      return JSBI.equal(JSBI.BigInt(liquidityMinted), JSBI.BigInt(amount))
    }
    return false
  }

  checkUserBalances(): boolean {


    return false
  }

  checkPairReserves(): boolean {
    const { balancesesA, balancesesB, reserveses0, reserveses1, } = this.amounts
    const aomunt0 = JSBI.subtract(JSBI.BigInt(balancesesA[0]), JSBI.BigInt(balancesesA[1]))
    const aomunt1 = JSBI.subtract(JSBI.BigInt(balancesesB[0]), JSBI.BigInt(balancesesB[1]))

    const aEqual = JSBI.equal(JSBI.subtract(JSBI.BigInt(reserveses0[1]), JSBI.BigInt(reserveses0[0])), aomunt0)
    const bEqual = JSBI.equal(JSBI.subtract(JSBI.BigInt(reserveses1[1]), JSBI.BigInt(reserveses1[0])), aomunt1)
    return aEqual && bEqual
  }

  checkLPtotalSupply(): boolean {
    const { LPTotalSupplys, amountsToAdd, reserveses0, reserveses1, } = this.amounts
    const liquidityMinted = getLiquidityMinted(LPTotalSupplys[0], amountsToAdd, [
      reserveses0[0],
      reserveses1[0]
    ])
    if (liquidityMinted) {
      const amount = JSBI.subtract(JSBI.BigInt(LPTotalSupplys[1]), JSBI.BigInt(LPTotalSupplys[0]))
      return JSBI.equal(JSBI.BigInt(liquidityMinted), JSBI.BigInt(amount))
    }
    return false
  }
}
