import JSBI from "jsbi"
import { sqrt, isEqualInRange } from "../util"
import {
  MINIMUM_LIQUIDITY, ZERO
} from "../constants"

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

function quote(amountA: JSBI, reserveA: JSBI, reserveB: JSBI) {
  return JSBI.divide(JSBI.multiply(amountA, reserveB), reserveA)
}

export function getOptimalAmounts(a: JSBI, b: JSBI, reserveA: JSBI, reserveB: JSBI) {
  if (JSBI.equal(ZERO, reserveA) && JSBI.equal(ZERO, reserveB)) {
    return {
      amountAOptimal: a,
      amountBOptimal: b
    }
  }
  const amountAOptimal = quote(b, reserveB, reserveA)
  const amountBOptimal = quote(a, reserveA, reserveB)

  if (JSBI.lessThanOrEqual(amountAOptimal, a)) {
    return {
      amountAOptimal: amountAOptimal,
      amountBOptimal: b
    }
  }

  return {
    amountAOptimal: a,
    amountBOptimal: amountBOptimal
  }
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
      return isEqualInRange(JSBI.BigInt(liquidityMinted), JSBI.BigInt(amount))
    }
    return false
  }

  checkUserBalances(): boolean {
    const { balancesesA, balancesesB, reserveses0, reserveses1, amountsToAdd } = this.amounts

    const { amountAOptimal, amountBOptimal } = getOptimalAmounts(
      JSBI.BigInt(amountsToAdd[0]),
      JSBI.BigInt(amountsToAdd[1]),
      JSBI.BigInt(reserveses0[0]),
      JSBI.BigInt(reserveses1[0])
    )
    const userDebitAmountA = JSBI.subtract(JSBI.BigInt(balancesesA[0]), JSBI.BigInt(balancesesA[1]))
    const userDebitAomuntB = JSBI.subtract(JSBI.BigInt(balancesesB[0]), JSBI.BigInt(balancesesB[1]))

    const aEqual = isEqualInRange(userDebitAmountA, amountAOptimal)
    const bEqual = isEqualInRange(userDebitAomuntB, amountBOptimal)

    return aEqual && bEqual
  }

  checkPairReserves(): boolean {
    const { reserveses0, reserveses1, amountsToAdd } = this.amounts

    const { amountAOptimal, amountBOptimal } = getOptimalAmounts(
      JSBI.BigInt(amountsToAdd[0]),
      JSBI.BigInt(amountsToAdd[1]),
      JSBI.BigInt(reserveses0[0]),
      JSBI.BigInt(reserveses1[0])
    )

    const aEqual = isEqualInRange(JSBI.subtract(JSBI.BigInt(reserveses0[1]), JSBI.BigInt(reserveses0[0])), amountAOptimal)
    const bEqual = isEqualInRange(JSBI.subtract(JSBI.BigInt(reserveses1[1]), JSBI.BigInt(reserveses1[0])), amountBOptimal)

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
      return isEqualInRange(JSBI.BigInt(liquidityMinted), JSBI.BigInt(amount))
    }
    return false
  }
}
