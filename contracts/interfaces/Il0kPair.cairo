# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.uint256 import Uint256

@contract_interface
namespace Il0kPair:
    #
    # ERC20
    #
    func name() -> (name : felt):
    end

    func symbol() -> (symbol : felt):
    end

    func decimals() -> (decimals : felt):
    end

    func totalSupply() -> (totalSupply : Uint256):
    end

    func balanceOf(account : felt) -> (balance : Uint256):
    end

    func allowance(owner : felt, spender : felt) -> (remaining : Uint256):
    end

    func transfer(recipient : felt, amount : Uint256) -> (success : felt):
    end

    func transferFrom(sender : felt, recipient : felt, amount : Uint256) -> (success : felt):
    end

    func approve(spender : felt, amount : Uint256) -> (success : felt):
    end

    #
    # Pair
    #
    func MINIMUM_LIQUIDITY() -> (value : Uint256):
    end

    func factory() -> (factory : felt):
    end

    func token0() -> (token0 : felt):
    end

    func token1() -> (token1 : felt):
    end

    func getReserves() -> (reserve0 : felt, reserve1 : felt, blockTimestampLast : felt):
    end

    func price0CumulativeLast() -> (price0 : Uint256):
    end

    func price1CumulativeLast() -> (price1 : Uint256):
    end

    func kLast() -> (kLast : Uint256):
    end

    func mint(to : felt) -> (liquidity : Uint256):
    end

    func burn(to : felt) -> (amount0 : Uint256, amount1 : Uint256):
    end

    func swap(amount0Out : Uint256, amount1Out : Uint256, to : felt) -> ():
    end

    # force balances to match reserves
    func skim(to : felt) -> ():
    end

    # force reserves to match balances
    func sync() -> ():
    end

    func initialize(token0 : felt, token1 : felt) -> ():
    end
end
