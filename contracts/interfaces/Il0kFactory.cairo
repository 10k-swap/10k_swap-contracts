# SPDX-License-Identifier: MIT

%lang starknet

@contract_interface
namespace Il0kFactory:
    func feeTo() -> (feeTo : felt):
    end

    func feeToSetter() -> (feeToSetter : felt):
    end

    func getPair(tokenA : felt, tokenB : felt) -> (pair : felt):
    end

    func allPairs(index : felt) -> (pair : felt):
    end

    func allPairsLength() -> (length : felt):
    end

    func createPair(tokenA : felt, tokenB : felt) -> (pair : felt):
    end

    func setFeeTo(feeTo : felt) -> ():
    end

    func setFeeToSetter(feeToSetter : felt) -> ():
    end
end
