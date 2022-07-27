# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_le,
    uint256_mul,
    uint256_unsigned_div_rem,
)

# Copy from https://github.com/NethermindEth/Cairo-SafeMath/blob/8261ae6c5210bc53ab029045b32e76f08794fe4c/src/mul.cairo
func warp_mul256{range_check_ptr}(lhs : Uint256, rhs : Uint256) -> (res : Uint256):
    let (result : Uint256, overflow : Uint256) = uint256_mul(lhs, rhs)
    assert overflow.low = 0
    assert overflow.high = 0
    return (result)
end

# Copy from https://github.com/NethermindEth/warp/blob/941108fe2a683c0b675d475bbee528e02726f99e/warplib/maths/div.cairo
func warp_div256{range_check_ptr}(lhs : Uint256, rhs : Uint256) -> (res : Uint256):
    if rhs.high == 0:
        if rhs.low == 0:
            with_attr error_message("Division by zero error"):
                assert 1 = 0
            end
        end
    end
    let (res : Uint256, _) = uint256_unsigned_div_rem(lhs, rhs)
    return (res)
end

func min_uint256{range_check_ptr}(a : Uint256, b : Uint256) -> (min : Uint256):
    let (is_a_leq_b) = uint256_le(a, b)
    if is_a_leq_b == TRUE:
        return (a)
    end
    return (b)
end
