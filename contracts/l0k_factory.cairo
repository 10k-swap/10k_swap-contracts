%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.math import assert_nn, assert_not_equal, assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.syscalls import deploy

from interfaces.Il0kPair import Il0kPair

#
# Constants
#

const _MINIMUM_LIQUIDITY = 10 ** 3

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
func _pairContractClassHash() -> (pairContractClassHash : felt):
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
    pairContractClassHash : felt, feeToSetter : felt
):
    _pairContractClassHash.write(pairContractClassHash)
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

    let (length) = _allPairsLength.read()
    let (pairContractClassHash) = _pairContractClassHash.read()

    let (newPair) = deploy(
        class_hash=pairContractClassHash,
        contract_address_salt=length,
        constructor_calldata_size=0,
        constructor_calldata=cast(new (), felt*),
    )
    Il0kPair.initialize(contract_address=newPair, token0=token0, token1=token1)

    _getPair.write(token0, token1, newPair)
    _getPair.write(token1, token0, newPair)
    _allPairs.write(length, newPair)
    let newLength = length + 1
    _allPairsLength.write(newLength)

    PairCreated.emit(token0, token1, newPair, newLength)

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
