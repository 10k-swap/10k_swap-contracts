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
func _allPairs(index : felt) -> (pair : felt):
end

@storage_var
func _allPairsLength() -> (length : felt):
end

# An event emitted whenever increase_balance() is called.
# current_balance is the balance before it was increased.
@event
func increase_balance_called(current_balance : felt, amount : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    feeToSetter : felt
):
    _feeToSetter.write(feeToSetter)
    return ()
end

@external
func createPair{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt, tokenB : felt
) -> (pair : felt):
    with_attr error_message("10kSwap: IDENTICAL_ADDRESSES"):
        assert_not_equal(tokenA, tokenB)
    end

    let (comp) = is_le_felt(tokenA, tokenB)

    if comp == 1:
        _feeTo.write(123)
        return (pair=1)
    end

    return (pair=0)
end

@external
func setFeeTo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(feeTo : felt) -> (
    ):
    onlyFeeToSetter()
    _feeTo.write(feeTo)
    return ()
end

@external
func setFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    feeToSetter : felt
) -> ():
    onlyFeeToSetter()
    _feeToSetter.write(feeToSetter)
    return ()
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
func getPair{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    token0 : felt, token1 : felt
) -> (pair : felt):
    let (value) = _getPair.read(token0, token1)
    return (pair=value)
end

@view
func allPairs{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
    pair : felt
):
    let (value) = _allPairs.read(index)
    return (pair=value)
end

@view
func allPairsLength{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    length : felt
):
    let (value) = _allPairsLength.read()
    return (length=value)
end

func onlyFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (caller) = get_caller_address()
    let (feeToSetter) = _feeToSetter.read()
    with_attr error_message("10kSwap: FORBIDDEN"):
        assert feeToSetter = caller
    end
    return ()
end
