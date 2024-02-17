# SPDX-License-Identifier: MIT

%lang starknet

from starkware.starknet.common.syscalls import get_caller_address

from openzeppelin.token.erc20.library import ERC20

@constructor
func constructor(name: felt, symbol: felt):
    let owner = get_caller_address()
    ERC20.initializer(name, symbol, 18)

@view
func name() -> felt:
    return ERC20.name()

@view
func symbol() -> felt:
    return ERC20.symbol()

@view
func totalSupply() -> felt:
    return ERC20.total_supply().val

@view
func decimals() -> felt:
    return ERC20.decimals()

@view
func balanceOf(account: felt) -> felt:
    return ERC20.balance_of(account).val

@view
func allowance(owner: felt, spender: felt) -> felt:
    return ERC20.allowance(owner, spender).val

@external
func transfer(recipient: felt, amount: felt):
    ERC20.transfer(recipient, amount)

@external
func transferFrom(sender: felt, recipient: felt, amount: felt):
    ERC20.transfer_from(sender, recipient, amount)

@external
func approve(spender: felt, amount: felt):
    ERC20.approve(spender, amount)

@external
func increaseAllowance(spender: felt, added_value: felt):
    ERC20.increase_allowance(spender, added_value)

@external
func decreaseAllowance(spender: felt, subtracted_value: felt):
    ERC20.decrease_allowance(spender, subtracted_value)

@external
func mint(to: felt, amount: felt):
    ERC20._mint(to, amount)
