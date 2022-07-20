%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address

#
# Events
#

@event
func PairCreated(token0 : felt, token1 : felt, pair : felt, index : felt):
end

#
# Storage
#

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
# Public functions
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
    let token0 = tokenB
    let token1 = tokenA
    if comp == 1:
        token0 = tokenA
        token1 = tokenB
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

