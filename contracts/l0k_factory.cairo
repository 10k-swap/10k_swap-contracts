%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import FALSE
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address, deploy
from starkware.cairo.common.hash import hash2

from interfaces.Il0kPair import Il0kPair
from libraries.l0k_library import l0kLibrary

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
func _pairClass() -> (pairClass : felt):
end

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
    pairClass : felt, feeToSetter : felt
):
    _pairClass.write(pairClass)
    _feeToSetter.write(feeToSetter)
    return ()
end

#
# Getters
#

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
# Externals
#

@external
func createPair{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    tokenA : felt, tokenB : felt
) -> (pair : felt):
    alloc_locals

    let (token0, token1) = l0kLibrary.sortTokens(tokenA, tokenB)

    # Pair exists
    with_attr error_message("10kSwap: PE"):
        let (pair) = _getPair.read(token0, token1)
        assert pair = 0
    end

    let (pairClass) = _pairClass.read()
    let (salt) = hash2{hash_ptr=pedersen_ptr}(token0, token1)
    # https://www.cairo-lang.org/docs/hello_starknet/deploying_from_contracts.html
    let (newPair) = deploy(
        class_hash=pairClass,
        contract_address_salt=salt,
        constructor_calldata_size=0,
        constructor_calldata=cast(new (), felt*),
        deploy_from_zero=FALSE,
    )
    Il0kPair.initialize(contract_address=newPair, token0=token0, token1=token1)

    _getPair.write(token0, token1, newPair)
    _getPair.write(token1, token0, newPair)

    let (length) = _allPairsLength.read()
    _allPairs.write(length, newPair)
    let newLength = length + 1
    _allPairsLength.write(newLength)

    PairCreated.emit(token0, token1, newPair, newLength)

    return (newPair)
end

@external
func setFeeTo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(feeTo : felt) -> (
    ):
    _onlyFeeToSetter()
    _feeTo.write(feeTo)
    return ()
end

@external
func setFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    feeToSetter : felt
) -> ():
    _onlyFeeToSetter()
    _feeToSetter.write(feeToSetter)
    return ()
end

#
# Internal
#

func _onlyFeeToSetter{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (caller) = get_caller_address()
    let (feeToSetter) = _feeToSetter.read()
    # Forbidden
    with_attr error_message("10kSwap: FB"):
        assert feeToSetter = caller
    end
    return ()
end
