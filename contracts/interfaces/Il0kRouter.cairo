# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.uint256 import Uint256

@contract_interface
namespace Il0kRouter:
    func factory() -> (factory : felt):
    end

    func quote(amountA : Uint256, reserveA : felt, reserveB : felt) -> (amountB : Uint256):
    end

    func getAmountOut(amountIn : Uint256, reserveIn : felt, reserveOut : felt) -> (
        amountOut : Uint256
    ):
    end

    func getAmountIn(amountOut : Uint256, reserveIn : felt, reserveOut : felt) -> (
        amountIn : Uint256
    ):
    end

    func getAmountsOut(amountIn : Uint256, path_len : felt, path : felt*) -> (
        amounts_len : felt, amounts : Uint256*
    ):
    end

    func getAmountsIn(amountOut : Uint256, path_len : felt, path : felt*) -> (
        amounts_len : felt, amounts : Uint256*
    ):
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

    func swapExactTokensForTokens(
        amountIn : Uint256,
        amountOutMin : Uint256,
        path_len : felt,
        path : felt*,
        to : felt,
        deadline : felt,
    ) -> (amounts_len : felt, amounts : Uint256*):
    end

    func swapTokensForExactTokens(
        amountOut : Uint256,
        amountInMax : Uint256,
        path_len : felt,
        path : felt*,
        to : felt,
        deadline : felt,
    ) -> (amounts_len : felt, amounts : Uint256*):
    end

    func swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn : Uint256,
        amountOutMin : Uint256,
        path_len : felt,
        path : felt*,
        to : felt,
        deadline : felt,
    ) -> (balance : Uint256):
    end
end
