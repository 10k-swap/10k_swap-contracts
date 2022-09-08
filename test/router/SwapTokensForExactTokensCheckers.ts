import JSBI from "jsbi"
import { FEES_DENOMINATOR, FEES_NUMERATOR, ONE, ZERO } from "../constants";
import { isEqualInRange } from "../util";

function getAmountInA(outputAmount: JSBI, [reserve0, reserve1]: [string, string]): JSBI | undefined {
  if (
    JSBI.equal(JSBI.BigInt(reserve0), ZERO) ||
    JSBI.equal(JSBI.BigInt(reserve1), ZERO) ||
    JSBI.greaterThanOrEqual(outputAmount, JSBI.BigInt(reserve1))
  ) {
    return undefined
  }

  const outputReserve = JSBI.BigInt(reserve1)
  const inputReserve = JSBI.BigInt(reserve0)

  const numerator = JSBI.multiply(JSBI.multiply(inputReserve, outputAmount), FEES_DENOMINATOR)
  const denominator = JSBI.multiply(JSBI.subtract(outputReserve, outputAmount), FEES_NUMERATOR)
  const inputAmount = JSBI.add(JSBI.divide(numerator, denominator), ONE)

  return inputAmount
}

export default class SwapTokensForExactTokensCheckers {
  private amounts: {
    // [before,after]
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountBToSwap: string
  }
  private amountA: JSBI | undefined

  constructor(amounts: {
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountBToSwap: string
  }) {
    this.amounts = amounts
    this.amountA = getAmountInA(JSBI.BigInt(amounts.amountBToSwap), [amounts.reserveses0[0], amounts.reserveses1[0]])
  }

  checkUserBalances(): boolean {
    const { balancesesA, balancesesB, amountBToSwap } = this.amounts
    const debitAmountA = JSBI.subtract(JSBI.BigInt(balancesesA[0]), JSBI.BigInt(balancesesA[1]))
    const getAmountB = JSBI.subtract(JSBI.BigInt(balancesesB[1]), JSBI.BigInt(balancesesB[0]))

    if (!this.amountA) return false

    const aEqual = isEqualInRange(debitAmountA, JSBI.BigInt(this.amountA))
    const bEqual = isEqualInRange(JSBI.BigInt(amountBToSwap), getAmountB)

    return aEqual && bEqual
  }

  checkPairReserves(): boolean {
    const { reserveses0, reserveses1, amountBToSwap } = this.amounts
    const diffReservesA = JSBI.subtract(JSBI.BigInt(reserveses0[1]), JSBI.BigInt(reserveses0[0]))
    const diffReservesB = JSBI.subtract(JSBI.BigInt(reserveses1[0]), JSBI.BigInt(reserveses1[1]))

    if (!this.amountA) return false

    const aEqual = isEqualInRange(diffReservesA, this.amountA)
    const bEqual = isEqualInRange(JSBI.BigInt(amountBToSwap), diffReservesB)

    return aEqual && bEqual
  }
}