# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.uint256 import Uint256

@contract_interface
namespace Il0kRouter:
    func factory() -> (factory : felt):
    end

    func quote(amountA : Uint256, reserveA : Uint256, reserveB : Uint256) -> (amountB : Uint256):
    end

    func getAmountOut(amountIn : Uint256, reserveIn : Uint256, reserveOut : Uint256) -> (
        amountOut : Uint256
    ):
    end

    func getAmountIn(amountOut : Uint256, reserveIn : Uint256, reserveOut : Uint256) -> (
        amountIn : Uint256
    ):
    end

    # Todo
    func getAmountsOut() -> (amounts : Uint256*):
    end

    # Todo
    func getAmountsIn() -> (amounts : Uint256*):
    end

    func addLiquidity(
        tokenA : felt,
        tokenB : felt,
        amountADesired : Uint256,
        amountBDesired : Uint256,
        amountAMin : Uint256,
        amountBMin : Uint256,
        to : felt,
        deadline : Uint256,
    ) -> (amountA : Uint256, amountB : Uint256, liquidity : Uint256):
    end

    func removeLiquidity(
        tokenA : felt,
        tokenB : felt,
        liquidity : Uint256,
        amountAMin : Uint256,
        amountBMin : Uint256,
        to : felt,
        deadline : Uint256,
    ) -> (amountA : Uint256, amountB : Uint256):
    end

    # Todo
    func swapExactTokensForTokens() -> (totalSupply : Uint256):
    end

    # Todo
    func swapTokensForExactTokens(account : felt) -> (balance : Uint256):
    end

    # Todo
    func swapExactTokensForTokensSupportingFeeOnTransferTokens(account : felt) -> (
        balance : Uint256
    ):
    end
end
