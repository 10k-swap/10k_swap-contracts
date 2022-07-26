%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from libraries.helper import felt_to_uint256

# Adds demo tokens to the given account.
@external
func test_felt_to_uint256{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    low : felt
) -> (value : Uint256):
    let (value) = felt_to_uint256(low)
    return (value=value)
end
