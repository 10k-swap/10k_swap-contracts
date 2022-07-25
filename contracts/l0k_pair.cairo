%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address

from openzeppelin.token.erc20.library import ERC20

#
# ERC20 === start ===
#

@view
func name{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (name : felt):
    let (name) = ERC20.name()
    return (name)
end

@view
func symbol{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (symbol : felt):
    let (symbol) = ERC20.symbol()
    return (symbol)
end

@view
func totalSupply{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    totalSupply : Uint256
):
    let (totalSupply) = ERC20.total_supply()
    return (totalSupply)
end

@view
func decimals{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    decimals : felt
):
    let (decimals) = ERC20.decimals()
    return (decimals)
end

@view
func balanceOf{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    account : felt
) -> (balance : Uint256):
    let (balance) = ERC20.balance_of(account)
    return (balance)
end

@view
func allowance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    owner : felt, spender : felt
) -> (remaining : Uint256):
    let (remaining) = ERC20.allowance(owner, spender)
    return (remaining)
end

@external
func transfer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    recipient : felt, amount : Uint256
) -> (success : felt):
    ERC20.transfer(recipient, amount)
    return (TRUE)
end

@external
func transferFrom{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    sender : felt, recipient : felt, amount : Uint256
) -> (success : felt):
    ERC20.transfer_from(sender, recipient, amount)
    return (TRUE)
end

@external
func approve{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    spender : felt, amount : Uint256
) -> (success : felt):
    ERC20.approve(spender, amount)
    return (TRUE)
end

@external
func increaseAllowance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    spender : felt, added_value : Uint256
) -> (success : felt):
    ERC20.increase_allowance(spender, added_value)
    return (TRUE)
end

@external
func decreaseAllowance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    spender : felt, subtracted_value : Uint256
) -> (success : felt):
    ERC20.decrease_allowance(spender, subtracted_value)
    return (TRUE)
end

#
# ERC20 === end ===
#

#
# Pair === start ===
#

#
# Constants
#

# Cairo supports defining constant expressions (only integers(felt))
# https://www.cairo-lang.org/docs/how_cairo_works/consts.html
const _MINIMUM_LIQUIDITY = 10 ** 3

#
# Events
#

@event
func Mint(sender : Uint256, amount0 : Uint256, amount1 : Uint256):
end

@event
func Burn(sender : felt, amount0 : Uint256, amount1 : Uint256, to : felt):
end

@event
func Swap(
    sender : felt,
    amount0In : Uint256,
    amount1In : Uint256,
    amount0Out : Uint256,
    amount1Out : Uint256,
    to : felt,
):
end

@event
func Sync(reserve0 : felt, reserve1 : felt):
end

#
# Storage
#

@storage_var
func _factory() -> (factory : felt):
end

@storage_var
func _token0() -> (token0 : felt):
end

@storage_var
func _token1() -> (token1 : felt):
end

# Type: uint112
@storage_var
func _reserve0() -> (reserve0 : felt):
end

@storage_var
func _reserve1() -> (reserve1 : felt):
end

@storage_var
func _blockTimestampLast() -> (blockTimestampLast : felt):
end

@storage_var
func _price0CumulativeLast() -> (price0CumulativeLast : Uint256):
end

@storage_var
func _price1CumulativeLast() -> (price1CumulativeLast : Uint256):
end

# reserve0 * reserve1, as of immediately after the most recent liquidity event
@storage_var
func _kLast() -> (kLast : Uint256):
end

#
# Constructor
#

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (sender) = get_caller_address()
    _factory.write(sender)
    return ()
end

#
# Getters
#

@view
func MINIMUM_LIQUIDITY{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    MINIMUM_LIQUIDITY : felt
):
    return (MINIMUM_LIQUIDITY=_MINIMUM_LIQUIDITY)
end

@view
func factory{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    factory : felt
):
    let (value) = _factory.read()
    return (factory=value)
end

@view
func token0{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (token0 : felt):
    let (value) = _token0.read()
    return (token0=value)
end
@view
func token1{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (token1 : felt):
    let (value) = _token1.read()
    return (token1=value)
end

@view
func blockTimestampLast{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    blockTimestampLast : felt
):
    let (value) = _blockTimestampLast.read()
    return (blockTimestampLast=value)
end

@view
func price0CumulativeLast{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    price0CumulativeLast : Uint256
):
    let (value) = _price0CumulativeLast.read()
    return (price0CumulativeLast=value)
end

@view
func price1CumulativeLast{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    price1CumulativeLast : Uint256
):
    let (value) = _price1CumulativeLast.read()
    return (price1CumulativeLast=value)
end

@view
func kLast{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    kLast : Uint256
):
    let (value) = _kLast.read()
    return (kLast=value)
end

#
# Externals
#

# called once by the factory at time of deployment
@external
func initialize{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    token0 : felt, token1 : felt
) -> ():
    let (factory) = _factory.read()
    let (sender) = get_caller_address()
    with_attr error_message("10kSwap: FB"):
        assert factory = sender
    end

    _token0.write(token0)
    _token1.write(token1)

    return ()
end

#
# Internal
#

# func onlyFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
#     let (caller) = get_caller_address()
#     let (feeToSetter) = _feeToSetter.read()
#     with_attr error_message("10kSwap: F"):
#         assert feeToSetter = caller
#     end
#     return ()
# end

#
# Pair === end ===
#
