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

const _MINIMUM_LIQUIDITY = Uint256(10 ** 3, 0)

#
# Events
#

func Mint(sender : Uint256, amount0 : Uint256, amount1 : Uint256):
end

func Burn(sender : felt, amount0 : Uint256, amount1 : Uint256, to : felt):
end

func Swap(
    sender : felt,
    amount0In : Uint256,
    amount1In : Uint256,
    amount0Out : Uint256,
    amount1Out : Uint256,
    to : felt,
):
end

# Todo
# func Sync(uint112 reserve0, uint112 reserve1):
# end

#
# Storage
#

@storage_var
func _factory() -> (feeTo : felt):
end

@storage_var
func _token0() -> (token0 : felt):
end

@storage_var
func _token1() -> (token1 : felt):
end

# uses single storage slot, accessible via getReserves
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
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    feeToSetter : felt
):
    _feeToSetter.write(feeToSetter)
    return ()
end

#
# Getters
#

@view
func MINIMUM_LIQUIDITY{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> ():
    let (value) = _feeTo.read()
    return (feeTo=value)
end

@view
func feeTo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (feeTo : felt):
    let (value) = _feeTo.read()
    return (feeTo=value)
end

#
# Externals
#

@external
func createPair{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt, tokenB : felt
) -> (pair : felt):
    alloc_locals

    with_attr error_message("10kSwap: IA"):
        assert_not_equal(tokenA, tokenB)
    end

    let (comp) = is_le_felt(tokenA, tokenB)
    local token0 : felt
    local token1 : felt
    if comp == 1:
        token0 = tokenA
        token1 = tokenB
    else:
        token0 = tokenB
        token1 = tokenA
    end
    with_attr error_message("10kSwap: ZA"):
        assert_not_zero(token0)
    end

    with_attr error_message("10kSwap: PE"):
        let (pair) = getPair(token0, token1)
        assert pair = 0
    end

    const newPair = 1001

    _getPair.write(token0, token1, newPair)
    _getPair.write(token1, token0, newPair)
    let (length) = _allPairsLength.read()
    _allPairs.write(newPair, length)
    _allPairsLength.write(length + 1)

    PairCreated.emit(token0, token1, newPair, length)

    return (newPair)
end

#
# Internal
#

func onlyFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (caller) = get_caller_address()
    let (feeToSetter) = _feeToSetter.read()
    with_attr error_message("10kSwap: F"):
        assert feeToSetter = caller
    end
    return ()
end

#
# Pair === end ===
#
