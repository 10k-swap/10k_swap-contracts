# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_le,
    uint256_mul,
    uint256_unsigned_div_rem,
)
from warplib.maths.div import warp_div
from warplib.maths.mul import warp_mul224

const Q112 = 2 ** 112

# encode a uint112 as a uq112x112
func encode{range_check_ptr : felt}(y : felt) -> (z : felt):
    # never overflows
    let (z) = warp_mul224(y, Q112)
    return (z)
end

# divide a uq112x112 by a uint112, returning a uq112x112
func uqdiv{range_check_ptr : felt}(x : felt, y : felt) -> (z : felt):
    let (z) = warp_div(x, y)
    return (z)
end
