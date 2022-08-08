%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, BitwiseBuiltin
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.math_cmp import is_le_felt, is_not_zero
from starkware.cairo.common.bitwise import bitwise_or, bitwise_and
from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_lt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import (
    deploy,
    get_caller_address,
    get_contract_address,
    get_block_timestamp,
)
from starkware.cairo.common.hash import hash2

from openzeppelin.token.erc20.interfaces.IERC20 import IERC20

from interfaces.Il0kFactory import Il0kFactory
from interfaces.Il0kPair import Il0kPair
from libraries.l0k_library import l0kLibrary

#
# Events
#

@event
func PairCreated(token0 : felt, token1 : felt, pair : felt, index : felt):
end

#
# Storage
#

@storage_var
func _factory() -> (factory : felt):
end

@storage_var
func _pairClass() -> (pairClass : felt):
end

#
# Constructor
#

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    factory : felt, pairClass : felt
):
    _factory.write(factory)
    _pairClass.write(pairClass)
    return ()
end

#
# Getters
#

# @view
# func feeTo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (feeTo : felt):
#     let (value) = _feeTo.read()
#     return (feeTo=value)
# end

#
# Externals
#

@external
func addLiquidity{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr, bitwise_ptr : BitwiseBuiltin*
}(
    tokenA : felt,
    tokenB : felt,
    amountADesired : Uint256,
    amountBDesired : Uint256,
    amountAMin : Uint256,
    amountBMin : Uint256,
    to : felt,
    deadline : felt,
) -> (amountA : Uint256, amountB : Uint256, liquidity : Uint256):
    alloc_locals

    _ensure(deadline)

    let (factory) = _factory.read()
    let (pairClass) = _pairClass.read()
    let (caller) = get_caller_address()

    let (amountA : Uint256, amountB : Uint256) = _addLiquidity(
        tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin
    )
    let (pair) = l0kLibrary.pairFor(factory, pairClass, tokenA, tokenB)

    # TODO. Not implemented safeTransferFrom
    IERC20.transferFrom(contract_address=tokenA, sender=caller, recipient=pair, amount=amountA)
    IERC20.transferFrom(contract_address=tokenB, sender=caller, recipient=pair, amount=amountB)

    let (liquidity : Uint256) = Il0kPair.mint(contract_address=pair, to=to)

    return (amountA=amountA, amountB=amountB, liquidity=liquidity)
end

@external
func removeLiquidity{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt,
    tokenB : felt,
    liquidity : Uint256,
    amountAMin : Uint256,
    amountBMin : Uint256,
    to : felt,
    deadline : felt,
) -> (amountA : Uint256, amountB : Uint256):
    alloc_locals

    _ensure(deadline)

    let (amountA : Uint256, amountB : Uint256) = _removeLiquidity(tokenA, tokenB, liquidity, to)

    # Insufficient_a_amount
    with_attr error_message("10kSwap: IAA"):
        let (lt0) = uint256_lt(amountA, amountAMin)
        assert lt0 = FALSE
    end

    # Insufficient_b_amount
    with_attr error_message("10kSwap: IBA"):
        let (lt0) = uint256_lt(amountB, amountBMin)
        assert lt0 = FALSE
    end

    return (amountA=amountA, amountB=amountB)
end

#
# Internal
#

func _ensure{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(deadline : felt):
    alloc_locals

    # Expired
    with_attr error_message("10kSwap: E"):
        let (block_timestamp) = get_block_timestamp()
        let (le) = is_le_felt(block_timestamp, deadline)
        assert le = TRUE
    end

    return ()
end

func _addLiquidity{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr, bitwise_ptr : BitwiseBuiltin*
}(
    tokenA : felt,
    tokenB : felt,
    amountADesired : Uint256,
    amountBDesired : Uint256,
    amountAMin : Uint256,
    amountBMin : Uint256,
) -> (amountA : Uint256, amountB : Uint256):
    alloc_locals

    let (factory) = _factory.read()
    let (pairClass) = _pairClass.read()

    let (pair) = Il0kFactory.getPair(contract_address=factory, tokenA=tokenA, tokenB=tokenB)
    if pair == 0:
        Il0kFactory.createPair(contract_address=factory, tokenA=tokenA, tokenB=tokenB)
    end

    let (reserveA, reserveB) = l0kLibrary.getReserves(factory, pairClass, tokenA, tokenB)

    let (rA_neq0) = is_not_zero(reserveA)
    let (rB_neq0) = is_not_zero(reserveB)
    let (b0) = bitwise_and(1 - rA_neq0, 1 - rB_neq0)
    if b0 == TRUE:
        return (amountA=amountADesired, amountB=amountBDesired)
    else:
        let (amountBOptimal) = l0kLibrary.quote(amountADesired, reserveA, reserveB)
        let (le1) = uint256_le(amountBOptimal, amountBDesired)
        if le1 == TRUE:
            # Insufficient_b_amount
            with_attr error_message("10kSwap: IBA"):
                let (lt2) = uint256_lt(amountBOptimal, amountBMin)
                assert lt2 = FALSE
            end

            return (amountA=amountADesired, amountB=amountBOptimal)
        else:
            let (amountAOptimal) = l0kLibrary.quote(amountBDesired, reserveB, reserveA)

            let (le2) = uint256_le(amountAOptimal, amountADesired)
            assert le2 = TRUE

            # Insufficient_a_amount
            with_attr error_message("10kSwap: IAA"):
                let (lt2) = uint256_lt(amountAOptimal, amountAMin)
                assert lt2 = FALSE
            end

            return (amountA=amountAOptimal, amountB=amountBDesired)
        end
    end
end

func _removeLiquidity{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt, tokenB : felt, liquidity : Uint256, to : felt
) -> (amountA : Uint256, amountB : Uint256):
    alloc_locals

    let (factory) = _factory.read()
    let (pairClass) = _pairClass.read()
    let (caller) = get_caller_address()

    let (pair) = l0kLibrary.pairFor(factory, pairClass, tokenA, tokenB)

    # send liquidity to pair
    Il0kPair.transferFrom(contract_address=pair, sender=caller, recipient=pair, amount=liquidity)

    let (amount0 : Uint256, amount1 : Uint256) = Il0kPair.burn(contract_address=pair, to=to)

    let (token0, _) = l0kLibrary.sortTokens(tokenA, tokenB)

    if tokenA == token0:
        return (amountA=amount0, amountB=amount1)
    else:
        return (amountA=amount1, amountB=amount0)
    end
end
