%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_check, uint256_sub, uint256_eq
from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.syscalls import get_contract_address

from openzeppelin.security.reentrancyguard import ReentrancyGuard
from openzeppelin.security.safemath import SafeUint256
from openzeppelin.token.erc20.library import (
    ERC20,
    ERC20_name,
    ERC20_symbol,
    ERC20_total_supply,
    ERC20_balances,
    Transfer,
)
from openzeppelin.token.erc20.interfaces.IERC20 import IERC20

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

#
# Externals
#

@external
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> ():
    ERC20_name.write('10K Swap Token')
    ERC20_symbol.write('10K')
    return ()
end

# this low-level function should be called from a contract which performs important safety checks
@external
func mint{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(to : felt) -> (
    liquidity : Uint256
):
    ReentrancyGuard._start()

    let amount = Uint256(low=100, high=0)
    _mint(to, amount)

    ReentrancyGuard._end()
    return (liquidity=amount)
end

#
# Internal
#

func _mint{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    recipient : felt, amount : Uint256
):
    with_attr error_message("ERC20: amount is not a valid Uint256"):
        uint256_check(amount)
    end

    # Remove zero address check
    # with_attr error_message("ERC20: cannot mint to the zero address"):
    #     assert_not_zero(recipient)
    # end

    let (supply : Uint256) = ERC20_total_supply.read()
    with_attr error_message("ERC20: mint overflow"):
        let (new_supply : Uint256) = SafeUint256.add(supply, amount)
    end
    ERC20_total_supply.write(new_supply)

    let (balance : Uint256) = ERC20_balances.read(account=recipient)
    # overflow is not possible because sum is guaranteed to be less than total supply
    # which we check for overflow below
    let (new_balance : Uint256) = SafeUint256.add(balance, amount)
    ERC20_balances.write(recipient, new_balance)

    Transfer.emit(0, recipient, amount)
    return ()
end

#
# Pair === end ===
#
