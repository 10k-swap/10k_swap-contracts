import JSBI from "jsbi"
import { sqrt } from "../util"
import { FIVE, ZERO } from "../constants"

function getTotalSupplyAdjusted(totalSupply: string, [reserve0, reserve1]: [string, string], feeOn: boolean, kLast: string) {
  let totalSupplyAdjusted: JSBI
  if (!feeOn) {
    totalSupplyAdjusted = JSBI.BigInt(totalSupply)
  } else {
    const kLastParsed = JSBI.BigInt(kLast)
    if (!JSBI.equal(kLastParsed, ZERO)) {
      const rootK = sqrt(JSBI.multiply(JSBI.BigInt(reserve0), JSBI.BigInt(reserve1)))
      const rootKLast = sqrt(kLastParsed)
      if (JSBI.greaterThan(rootK, rootKLast)) {
        const numerator = JSBI.multiply(JSBI.BigInt(totalSupply), JSBI.subtract(rootK, rootKLast))
        const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast)
        const feeLiquidity = JSBI.divide(numerator, denominator)
        totalSupplyAdjusted = JSBI.add(JSBI.BigInt(totalSupply), feeLiquidity)
      } else {
        totalSupplyAdjusted = JSBI.BigInt(totalSupply)
      }
    } else {
      totalSupplyAdjusted = JSBI.BigInt(totalSupply)
    }
  }
  return totalSupplyAdjusted
}

export function getLiquidityValue(totalSupply: string, liquidity: string, [reserve0, reserve1]: [string, string], feeOn: boolean, kLast: string) {
  const totalSupplyAdjusted = getTotalSupplyAdjusted(totalSupply, [reserve0, reserve1], feeOn, kLast)

  return [
    JSBI.divide(JSBI.multiply(JSBI.BigInt(liquidity), JSBI.BigInt(reserve0)), totalSupplyAdjusted),
    JSBI.divide(JSBI.multiply(JSBI.BigInt(liquidity), JSBI.BigInt(reserve1)), totalSupplyAdjusted)
  ]
}

export default class RemoveLiquidityCheckers {
  private amounts: {
    // [before,after]
    userLPs: [string, string],
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    LPTotalSupplys: [string, string],

    amountsToRemove: string
    kLast: string
  }

  constructor(amounts: {
    userLPs: [string, string],
    LPTotalSupplys: [string, string],
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountsToRemove: string
    kLast: string
  }) {
    this.amounts = amounts
  }

  checkUserLPBalance(): boolean {
    const { userLPs, amountsToRemove } = this.amounts
    const amount = JSBI.subtract(JSBI.BigInt(userLPs[0]), JSBI.BigInt(userLPs[1]))

    return JSBI.equal(JSBI.BigInt(amountsToRemove), JSBI.BigInt(amount))
  }

  checkUserBalances(): boolean {
    const { balancesesA, balancesesB, reserveses0, reserveses1, LPTotalSupplys, kLast, amountsToRemove } = this.amounts

    const [A, B] = getLiquidityValue(
      LPTotalSupplys[0],
      amountsToRemove,
      [reserveses0[0], reserveses1[0]],
      true,
      kLast
    )
    const userGetAmountA = JSBI.subtract(JSBI.BigInt(balancesesA[1]), JSBI.BigInt(balancesesA[0]))
    const userGetAomuntB = JSBI.subtract(JSBI.BigInt(balancesesB[1]), JSBI.BigInt(balancesesB[0]))

    const aEqual = JSBI.equal(userGetAmountA, A)
    const bEqual = JSBI.equal(userGetAomuntB, B)

    return aEqual && bEqual
  }

  checkPairReserves(): boolean {
    const { reserveses0, reserveses1, LPTotalSupplys, kLast, amountsToRemove } = this.amounts

    const [A, B] = getLiquidityValue(
      LPTotalSupplys[0],
      amountsToRemove,
      [reserveses0[0], reserveses1[0]],
      true,
      kLast
    )

    const aEqual = JSBI.equal(JSBI.subtract(JSBI.BigInt(reserveses0[0]), JSBI.BigInt(reserveses0[1])), A)
    const bEqual = JSBI.equal(JSBI.subtract(JSBI.BigInt(reserveses1[0]), JSBI.BigInt(reserveses1[1])), B)

    return aEqual && bEqual
  }

  checkLPtotalSupply(): boolean {
    const { reserveses0, reserveses1, LPTotalSupplys, kLast, amountsToRemove } = this.amounts
    const totalSupplyAdjusted = getTotalSupplyAdjusted(LPTotalSupplys[0], [reserveses0[0], reserveses1[0]], true, kLast)

    return JSBI.equal(JSBI.BigInt(LPTotalSupplys[1]), JSBI.subtract(totalSupplyAdjusted, JSBI.BigInt(amountsToRemove)))
  }
}
