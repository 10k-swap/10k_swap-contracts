import JSBI from "jsbi"
import { FEES_DENOMINATOR, FEES_NUMERATOR, ZERO } from "../constants";
import { isEqualInRange } from "../util";

function getOutputAmountB(inputAmount: JSBI, [reserve0, reserve1]: [string, string]): JSBI | undefined {
  if (JSBI.equal(JSBI.BigInt(reserve0), ZERO) || JSBI.equal(JSBI.BigInt(reserve1), ZERO)) {
    return undefined
  }
  const inputReserve = JSBI.BigInt(reserve0)
  const outputReserve = JSBI.BigInt(reserve1)

  const inputAmountWithFee = JSBI.multiply(inputAmount, FEES_NUMERATOR)
  const numerator = JSBI.multiply(inputAmountWithFee, outputReserve)
  const denominator = JSBI.add(JSBI.multiply(inputReserve, FEES_DENOMINATOR), inputAmountWithFee)
  const outputAmount = JSBI.divide(numerator, denominator)

  if (JSBI.equal(outputAmount, ZERO)) {
    return undefined
  }

  return outputAmount
}

export default class SwapExactTokensForTokensCheckers {
  private amounts: {
    // [before,after]
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountAToSwap: string
  }
  private amountB: JSBI | undefined

  constructor(amounts: {
    balancesesA: [string, string],
    balancesesB: [string, string],
    reserveses0: [string, string],
    reserveses1: [string, string],
    amountAToSwap: string
  }) {
    this.amounts = amounts
    this.amountB = getOutputAmountB(JSBI.BigInt(amounts.amountAToSwap), [amounts.reserveses0[0], amounts.reserveses1[0]])
  }

  checkUserBalances(): boolean {
    const { balancesesA, balancesesB, amountAToSwap } = this.amounts
    const debitAmountA = JSBI.subtract(JSBI.BigInt(balancesesA[0]), JSBI.BigInt(balancesesA[1]))
    const getAmountB = JSBI.subtract(JSBI.BigInt(balancesesB[1]), JSBI.BigInt(balancesesB[0]))

    if (!this.amountB) {
      return false
    }

    const aEqual = isEqualInRange(debitAmountA, JSBI.BigInt(amountAToSwap))
    const bEqual = isEqualInRange(this.amountB, getAmountB)

    return aEqual && bEqual
  }

  checkPairReserves(): boolean {
    const { reserveses0, reserveses1, amountAToSwap } = this.amounts
    const diffReservesA = JSBI.subtract(JSBI.BigInt(reserveses0[1]), JSBI.BigInt(reserveses0[0]))
    const diffReservesB = JSBI.subtract(JSBI.BigInt(reserveses1[0]), JSBI.BigInt(reserveses1[1]))

    if (!this.amountB) {
      return false
    }

    const aEqual = isEqualInRange(diffReservesA, JSBI.BigInt(amountAToSwap))
    const bEqual = isEqualInRange(this.amountB, diffReservesB)

    return aEqual && bEqual
  }
}