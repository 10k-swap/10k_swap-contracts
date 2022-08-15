%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_check,
    uint256_sub,
    uint256_eq,
    uint256_sqrt,
    uint256_le,
    uint256_lt,
)

from openzeppelin.security.safemath.library import SafeUint256

from libraries.l0k_library import l0kLibrary

@view
func test_pairFor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    factory : felt, pairClass : felt, tokenA : felt, tokenB : felt
) -> (res : felt):
    let (pair) = l0kLibrary.pairFor(factory, pairClass, tokenA, tokenB)

    return (res=pair)
end

@view
func test_quote{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    amountA : Uint256, reserveA : felt, reserveB : felt
) -> (amountB : Uint256):
    let (amountB) = l0kLibrary.quote(amountA, reserveA, reserveB)

    return (amountB=amountB)
end
