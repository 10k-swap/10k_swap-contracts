# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.uint256 import Uint256, uint256_le

const Q112 = 2 ** 112

func min_uint256{range_check_ptr}(a : Uint256, b : Uint256) -> (min : Uint256):
    let (is_a_leq_b) = uint256_le(a, b)
    if is_a_leq_b == TRUE:
        return (a)
    end
    return (b)
end
