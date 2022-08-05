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
    uint256_mul,
)
from openzeppelin.security.safemath import SafeUint256

from warplib.maths.mul import warp_mul256

@view
func test_uint256_sub{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : Uint256):
    let (res) = uint256_sub(a, b)
    return (res=res)
end

@view
func test_oz_sub_le{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : Uint256):
    let (res) = SafeUint256.sub_le(a, b)
    return (res=res)
end

@view
func test_oz_sub_lt{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : Uint256):
    let (res) = SafeUint256.sub_lt(a, b)
    return (res=res)
end

@view
func test_mul_and_sqrt{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    amount0 : Uint256, amount1 : Uint256
) -> (res : Uint256):
    let (n) = warp_mul256(amount0, amount1)
    let (sq : Uint256) = uint256_sqrt(n)
    let (res : Uint256) = SafeUint256.sub_le(sq, Uint256(low=1000, high=0))
    return (res=res)
end

@view
func test_uint256_le{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : felt):
    let (res) = uint256_le(a, b)
    return (res=res)
end

@view
func test_uint256_lt{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : felt):
    let (res) = uint256_lt(a, b)
    return (res=res)
end

@view
func test_SafeUint256_mul{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    a : Uint256, b : Uint256
) -> (res : Uint256):
    alloc_locals

    foo(5)

    if 1 == 0:
        return (res=Uint256(0, 0))
    else:
        let (res) = SafeUint256.mul(a, b)
        return (res=res)
    end
end

func foo(n):
    if n == 0:
        return ()
    end
    foo(n=n - 1)
    return ()
end
