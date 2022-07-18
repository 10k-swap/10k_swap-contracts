%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal
from starkware.starknet.common.syscalls import get_caller_address

@storage_var
func _feeTo() -> (feeTo : felt):
end

@storage_var
func _feeToSetter() -> (feeToSetter : felt):
end

@storage_var
func _getPair(token0 : felt, token1 : felt) -> (pair : felt):
end

@storage_var
func _allPairs() -> (pair : felt):
end

# An event emitted whenever increase_balance() is called.
# current_balance is the balance before it was increased.
@event
func increase_balance_called(current_balance : felt, amount : felt):
end

@external
func createPair{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt, tokenB : felt
) -> (pair : felt):
    with_attr error_message("l0kSwap: IDENTICAL_ADDRESSES"):
        assert_not_equal(tokenA, tokenB)
    end

    let (comp) = is_le_felt(tokenA, tokenB)

    if comp == 1:
        _feeTo.write(123)
        return (pair=1)
    end

    return (pair=0)
end

@view
func feeTo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (feeTo : felt):
    let (value) = _feeTo.read()
    return (feeTo=value)
end

@view
func feeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    feeToSetter : felt
):
    let (value) = _feeToSetter.read()
    return (feeToSetter=value)
end


@view
func feeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    feeToSetter : felt
):
    let (value) = _feeToSetter.read()
    return (feeToSetter=value)
end
