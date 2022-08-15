# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.uint256 import Uint256, uint256_le
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_not_equal, assert_not_zero
from starkware.cairo.common.hash import hash2

from openzeppelin.security.safemath.library import SafeUint256

from warplib.maths.div import warp_div256

from interfaces.Il0kPair import Il0kPair

# String: STARKNET_CONTRACT_ADDRESS
const CONTRACT_ADDRESS_PREFIX = 523065374597054866729014270389667305596563390979550329787219

func min_uint256{range_check_ptr}(a : Uint256, b : Uint256) -> (min : Uint256):
    let (is_a_leq_b) = uint256_le(a, b)
    if is_a_leq_b == TRUE:
        return (a)
    end
    return (b)
end

namespace l0kLibrary:
    # Require tokenA != tokenB
    # If tokenA < tokenB : token0 = tokenA, token1 = tokenB
    # If tokenA > tokenB : token0 = tokenB, token1 = tokenA
    # Require token0 != 0
    func sortTokens{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        tokenA : felt, tokenB : felt
    ) -> (token0 : felt, token1 : felt):
        alloc_locals

        # Identical addresses
        with_attr error_message("10kSwap: IA"):
            assert_not_equal(tokenA, tokenB)
        end

        let (is_le) = is_le_felt(tokenA, tokenB)
        if is_le == TRUE:
            # Zero address
            with_attr error_message("10kSwap: ZA"):
                assert_not_zero(tokenA)
            end

            return (token0=tokenA, token1=tokenB)
        else:
            # Zero address
            with_attr error_message("10kSwap: ZA"):
                assert_not_zero(tokenB)
            end

            return (token0=tokenB, token1=tokenA)
        end
    end

    # calculates the contract address for a pair without making any external calls
    # For gas savings
    func pairFor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        factory : felt, pairClass : felt, tokenA : felt, tokenB : felt
    ) -> (pair : felt):
        alloc_locals

        let (token0, token1) = sortTokens(tokenA, tokenB)

        let (salt) = hash2{hash_ptr=pedersen_ptr}(token0, token1)
        let (constructorCalldataHash) = hash2{hash_ptr=pedersen_ptr}(0, 0)

        let (h0) = hash2{hash_ptr=pedersen_ptr}(0, CONTRACT_ADDRESS_PREFIX)
        let (h1) = hash2{hash_ptr=pedersen_ptr}(h0, factory)
        let (h2) = hash2{hash_ptr=pedersen_ptr}(h1, salt)
        let (h3) = hash2{hash_ptr=pedersen_ptr}(h2, pairClass)
        let (h4) = hash2{hash_ptr=pedersen_ptr}(h3, constructorCalldataHash)
        let (pair) = hash2{hash_ptr=pedersen_ptr}(h4, 5)

        return (pair=pair)
    end

    # fetches and sorts the reserves for a pair
    func getReserves{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        factory : felt, pairClass : felt, tokenA : felt, tokenB : felt
    ) -> (reserveA : felt, reserveB : felt):
        alloc_locals

        let (token0, _) = sortTokens(tokenA, tokenB)
        let (pair) = pairFor(factory, pairClass, tokenA, tokenB)

        let (reserve0, reserve1, _) = Il0kPair.getReserves(contract_address=pair)

        if tokenA == token0:
            return (reserveA=reserve0, reserveB=reserve1)
        else:
            return (reserveA=reserve1, reserveB=reserve0)
        end
    end

    # given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    func quote{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        amountA : Uint256, reserveA : felt, reserveB : felt
    ) -> (amountB : Uint256):
        alloc_locals

        # Insufficient amount
        with_attr error_message("10kSwapLibrary: IA"):
            let (is_le) = uint256_le(amountA, Uint256(0, 0))
            assert is_le = FALSE
        end

        # Insufficient liquidity
        with_attr error_message("10kSwapLibrary: IL"):
            let (rA) = is_le_felt(reserveA, 0)
            let (rB) = is_le_felt(reserveB, 0)

            assert (rA, rB) = (FALSE, FALSE)
        end

        let (m : Uint256) = SafeUint256.mul(amountA, Uint256(reserveB, 0))
        let (amountB : Uint256) = warp_div256(m, Uint256(reserveA, 0))

        return (amountB=amountB)
    end

    # given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    func getAmountOut{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        amountIn : Uint256, reserveIn : felt, reserveOut : felt
    ) -> (amountOut : Uint256):
        alloc_locals

        # Insufficient input amount
        with_attr error_message("10kSwapLibrary: IIA"):
            let (is_le) = uint256_le(amountIn, Uint256(0, 0))
            assert is_le = FALSE
        end

        # Insufficient liquidity
        with_attr error_message("10kSwapLibrary: IL"):
            let (rIn) = is_le_felt(reserveIn, 0)
            let (rOut) = is_le_felt(reserveOut, 0)

            assert (rIn, rOut) = (FALSE, FALSE)
        end

        let (amountInWithFee : Uint256) = SafeUint256.mul(amountIn, Uint256(997, 0))
        let (numerator : Uint256) = SafeUint256.mul(amountInWithFee, Uint256(reserveOut, 0))

        let (m : Uint256) = SafeUint256.mul(Uint256(reserveIn, 0), Uint256(1000, 0))
        let (denominator : Uint256) = SafeUint256.add(m, amountInWithFee)
        let (amountOut : Uint256) = warp_div256(numerator, denominator)

        return (amountOut=amountOut)
    end

    # given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    func getAmountIn{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        amountOut : Uint256, reserveIn : felt, reserveOut : felt
    ) -> (amountIn : Uint256):
        alloc_locals

        # Insufficient output amount
        with_attr error_message("10kSwapLibrary: IOA"):
            let (is_le) = uint256_le(amountOut, Uint256(0, 0))
            assert is_le = FALSE
        end

        # Insufficient liquidity
        with_attr error_message("10kSwapLibrary: IL"):
            let (rOut) = is_le_felt(reserveOut, 0)
            let (rIn) = is_le_felt(reserveIn, 0)

            assert (rOut, rIn) = (FALSE, FALSE)
        end

        # numerator = reserveIn * amountOut * 1000
        let (m0 : Uint256) = SafeUint256.mul(Uint256(reserveIn, 0), amountOut)
        let (numerator : Uint256) = SafeUint256.mul(m0, Uint256(1000, 0))

        # denominator = (reserveOut - amountOut) * 997
        let (s1 : Uint256) = SafeUint256.sub_le(Uint256(reserveOut, 0), amountOut)
        let (denominator : Uint256) = SafeUint256.mul(s1, Uint256(997, 0))

        # amountIn = numerator / denominator + 1
        let (m2 : Uint256) = warp_div256(numerator, denominator)
        let (amountIn : Uint256) = SafeUint256.add(m2, Uint256(1, 0))

        return (amountIn=amountIn)
    end

    # performs chained getAmountOut calculations on any number of pairs
    func getAmountsOut{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        factory : felt, pairClass : felt, amountIn : Uint256, path_len : felt, path : felt*
    ) -> (amounts_len : felt, amounts : Uint256*):
        alloc_locals

        # Invalid_path
        with_attr error_message("10kSwapLibrary: IP"):
            let (le) = is_le_felt(2, path_len)
            assert le = TRUE
        end

        let (local amounts : Uint256*) = alloc()
        assert amounts[0] = amountIn

        # *** Start loop ***
        tempvar reverse_idx = path_len - 1

        loop:
        tempvar i = path_len - reverse_idx - 1

        let (reserveIn, reserveOut) = getReserves(factory, pairClass, path[i], path[i + 1])
        let (amountOut) = getAmountOut(amounts[i], reserveIn, reserveOut)
        assert amounts[i + 1] = amountOut

        tempvar reverse_idx = reverse_idx - 1
        jmp loop if reverse_idx != 0
        # *** End loop ***

        return (amounts_len=path_len, amounts=amounts)
    end

    # performs chained getAmountIn calculations on any number of pairs
    func getAmountsIn{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        factory : felt, pairClass : felt, amountOut : Uint256, path_len : felt, path : felt*
    ) -> (amounts_len : felt, amounts : Uint256*):
        alloc_locals

        # Invalid_path
        with_attr error_message("10kSwapLibrary: IP"):
            let (le) = is_le_felt(2, path_len)
            assert le = TRUE
        end

        let (local amounts : Uint256*) = alloc()
        assert amounts[path_len - 1] = amountOut

        # *** Start loop ***
        tempvar reverse_idx = path_len - 1

        loop:
        tempvar i = reverse_idx

        let (reserveIn, reserveOut) = getReserves(factory, pairClass, path[i - 1], path[i])
        let (amountIn) = getAmountIn(amounts[i], reserveIn, reserveOut)
        assert amounts[i - 1] = amountIn

        tempvar reverse_idx = reverse_idx - 1
        jmp loop if reverse_idx != 0
        # *** End loop ***

        return (amounts_len=path_len, amounts=amounts)
    end
end
