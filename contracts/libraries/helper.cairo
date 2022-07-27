# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.uint256 import Uint256

# Low felt convert to Uint256
# @deprecated
func felt_to_uint256{}(low : felt) -> (value : Uint256):
    return (value=Uint256(low=low, high=0))
end
