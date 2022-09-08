# 10Kswap Contracts for Cairo

**A decentralized ZK Rollup AMM** written in Cairo for [StarkNet](https://starkware.co/product/starknet/).<br/>
10Kswap is actively exploring the updated user experience of ZK technology application on AMM(Including but not limited to lower gas fees, higher TPS).<br/>
Using the 10kswap AMM contract, token holder can freely create currency pairs without paying high fees.

Cairo-VM provides a new development option for the community, it can provide faster TPS, and its computing cost is almost negligible, we believe that AMM will be the most direct beneficiary of these two features. In the previous period, we overcame the difficulties faced by many early developers and implemented the first version to make it run stably. Next, we will explore the potential of zk-tech and develop an AMM that is more friendly to market makers and can control the distribution of liquidity more finely. The key technology is how to use Cairo to develop a "Rich Convex Function". If we are successful, it will bring great inspiration and reference to the zk community, allowing more Dapp developers to participate in the ecological construction.

In Cairo-VM, the gas consumption required to perform calculations is much lower than the state update (zk-rollup technical feature). Based on this feature, we will continue to optimize the contract (increase the appropriate amount of calculation to reduce the amount of state update), and further reduce gas fee.

At the same time, our development process is open source, and all processes can be used as reference materials. During this process, we will also timely organize two products that are useful to the community.<br />
1). A summary tutorial related to development.<br />
2). A more general and convenient development scaffold.<br />
3). Provide sdk and defi contract library to facilitate dapp development.<br />

## 10Kswap is on the testnet. To preview

[`https://10kswap.com`](https://10kswap.com)

![preview](./docs/images/preview.png)

## Get started

#### Clone this repo

```
git clone git@github.com:0x60018/10k_swap-contracts.git
cd 10k_swap-contracts
```

#### Install dependencies

```
yarn install
```

#### Compile a contract

```
npx hardhat starknet-compile contracts/l0k_factory.cairo
```

#### Run a test that interacts with the compiled contract

```
npx hardhat test l0k_factory.test.ts
```

## Branches

- `main` Stable version
- `develop` New PRs and features

## Contracts

### l0k_factory

[`l0k_factory.cairo`](./contracts/l0k_factory.cairo)

- Mainnet Adddress: `-`
- Goerli Adddress: `0x06c31f39524388c982045988de3788530605ed08b10389def2e7b1dd09d19308`

#### Events

```cairo
func PairCreated(token0 : felt, token1 : felt, pair : felt, index : felt):
end
```

- `token0` is guaranteed to be strictly less than `token1` by sort order.
- `pair` token0 & token1 pair address
- `index` pair index, start from 0

#### constructor

```cairo
func constructor(pairClass : felt, feeToSetter : felt):
end
```

- `pairClass` l0k_pair contract class hash
- `feeToSetter` feeTo address manager

#### Read Functions

##### feeTo

```cairo
func feeTo() -> (feeTo : felt):
end
```

- Returns `feeTo`

##### feeToSetter

```cairo
func feeToSetter() -> (feeToSetter : felt):
end
```

- Returns `feeToSetter`

##### getPair

```cairo
func getPair(token0 : felt, token1 : felt) -> (pair : felt):
end
```

- `token0` -
- `token1` -
- Returns `pair`

##### allPairs

```cairo
func allPairs(index : felt) -> (pair : felt):
end
```

- `index` pair index
- Returns `pair`

##### allPairsLength

```cairo
func allPairsLength() -> (length : felt):
end
```

- Returns `length`

#### Write Functions

##### createPair

```cairo
func createPair(tokenA : felt, tokenB : felt) -> (pair : felt):
end
```

- `tokenA` A token address
- `tokenB` B token address
- Returns `pair`
- Emits `PairCreated`

##### setFeeTo

```cairo
func setFeeTo(feeTo : felt) -> ():
end
```

- `feeTo` -

##### setFeeToSetter

```cairo
func setFeeToSetter(feeToSetter : felt) -> ():
end
```

- `feeToSetter` -

### l0k_pair

[`l0k_pair.cairo`](./contracts/l0k_pair.cairo)

- ClassHash: `0x231adde42526bad434ca2eb983efdd64472638702f87f97e6e3c084f264e06f`

> ERC20 functions and events based on openzeppelin cairo, [click here](https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/openzeppelin/token/erc20/library.cairo) for details.<br/>
> Thanks to [openzeppelin](https://github.com/OpenZeppelin/cairo-contracts) for powering cairo.

#### Events

##### Mint

```cairo
func Mint(sender : felt, amount0 : Uint256, amount1 : Uint256):
end
```

- `sender` Minter
- `amount0` Token0 amount
- `amount1` Token1 amount

##### Burn

```cairo
func Burn(sender : felt, amount0 : Uint256, amount1 : Uint256, to : felt):
end
```

- `sender` Burner
- `amount0` Token0 amount
- `amount1` Token1 amount
- `to` Recipient

##### Swap

```cairo
func Swap(
    sender : felt,
    amount0In : Uint256,
    amount1In : Uint256,
    amount0Out : Uint256,
    amount1Out : Uint256,
    to : felt,
):
end
```

- `sender` Swaper
- `amount0In` Token0 in amount
- `amount1In` Token1 in amount
- `amount0Out` Token0 out amount
- `amount1Out` Token1 out amount
- `to` Recipient

##### Sync

```cairo
func Sync(reserve0 : felt, reserve1 : felt):
end
```

- `reserve0` Token0 quantity in pair
- `reserve1` Token1 quantity in pair

#### Read Functions

##### MINIMUM_LIQUIDITY

```cairo
func MINIMUM_LIQUIDITY() -> (MINIMUM_LIQUIDITY : felt):
end
```

- `MINIMUM_LIQUIDITY` -

##### factory

```cairo
func factory() -> (factory : felt):
end
```

- `factory` l0k_factory contract

##### token0

```cairo
func token0() -> (token0 : felt):
end
```

- `token0` -

##### token1

```cairo
func token1() -> (token1 : felt):
end
```

- `token1` -

##### blockTimestampLast

```cairo
func blockTimestampLast() -> (blockTimestampLast : felt):
end
```

- `blockTimestampLast` -

##### price0CumulativeLast

```cairo
func price0CumulativeLast() -> (price0CumulativeLast : felt):
end
```

- `price0CumulativeLast` -

##### price1CumulativeLast

```cairo
func price1CumulativeLast() -> (price1CumulativeLast : felt):
end
```

- `price1CumulativeLast` -

##### kLast

```cairo
func kLast() -> (kLast : felt):
end
```

- `kLast` -

##### getReserves

```cairo
func getReserves() -> (reserve0 : felt, reserve1 : felt, blockTimestampLast : felt):
end
```

- `reserve0` Token0 quantity in pair
- `reserve1` reserve1 quantity in pair
- `blockTimestampLast` -

#### Write Functions

##### initialize

```cairo
func initialize() -> (token0 : felt, token1 : felt):
end
```

> called once by the factory at time of deployment

- `token0` -
- `token1` -

##### mint

```cairo
func mint(to : felt) -> (liquidity : Uint256):
end
```

- `to` Recipient
- RETURNS: `liquidity` Pair token quantity
- Emits `Mint`, `Sync`, `Transfer`<sub>ERC20</sub>

##### burn

```cairo
func burn(to : felt) -> (amount0 : Uint256, amount1 : Uint256):
end
```

- `to` Recipient
- RETURNS: `amount0` Received token0 quantity, `amount1` Received token0 quantity
- Emits `Burn`, `Sync`, `Transfer`<sub>ERC20</sub>

##### swap

```cairo
func swap(amount0Out : Uint256, amount1Out : Uint256, to : felt) -> ():
end
```

- `amount0Out` -
- `amount1Out` -
- `to` Recipient
- Emits `Swap`, `Sync`

##### skim

```cairo
func skim() -> (to : felt):
end
```

- `to` Recipient

##### sync

```cairo
func sync() -> ():
end
```

- Emits `Sync`

### l0k_router

[`l0k_router.cairo`](./contracts/l0k_router.cairo)

- Mainnet Adddress: `-`
- Goerli Adddress: `0x00975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c664`

#### Read Functions

##### factory

```cairo
func factory() -> (factory : felt):
end
```

- `factory` l0k_factory contract

##### quote

```cairo
func quote(amountA : Uint256, reserveA : felt, reserveB : felt) -> (amountB : Uint256):
end
```

- `amountA` TokenA quantity
- `reserveA` TokenA quantity in pair
- `reserveB` TokenB quantity in pair
- Returns `amountB` Received tokenB quantity

##### getAmountOut

```cairo
func getAmountOut(amountIn : Uint256, reserveIn : felt, reserveOut : felt) -> (amountOut : Uint256):
end
```

- `amountIn` TokenIn quantity
- `reserveIn` TokenIn quantity in pair
- `reserveOut` TokenOut quantity in pair
- Returns `amountOut` Received tokenOut quantity

##### getAmountIn

```cairo
func getAmountOut(amountOut : Uint256, reserveIn : felt, reserveOut : felt) -> (amountIn : Uint256):
end
```

- `amountOut` TokenOut quantity
- `reserveIn` TokenIn quantity in pair
- `reserveOut` TokenOut quantity in pair
- Returns `amountIn` Received tokenIn quantity

##### getAmountsOut

```cairo
func getAmountsOut(amountIn : Uint256, path_len : felt, path : felt*) -> (amounts_len : felt, amounts : Uint256*):
end
```

- `amountIn` TokenIn quantity
- `path_len` Path's length
- `path` [TokenA, TokenB, ...]
- Returns `amounts_len` amounts's length, `amounts` received tokens amount

##### getAmountsIn

```cairo
func getAmountsIn(amountOut : Uint256, path_len : felt, path : felt*) -> (amounts_len : felt, amounts : Uint256*):
end
```

- `amountOut` TokenOut quantity
- `path_len` Path's length
- `path` [TokenB, TokenA, ...]
- Returns `amounts_len` amounts's length, `amounts` send tokens amount

#### Write Functions

##### addLiquidity

```cairo
func addLiquidity(
    tokenA : felt,
    tokenB : felt,
    amountADesired : Uint256,
    amountBDesired : Uint256,
    amountAMin : Uint256,
    amountBMin : Uint256,
    to : felt,
    deadline : felt,
) -> (amountA : Uint256, amountB : Uint256, liquidity : Uint256):
end
```

- `tokenA` TokenA address
- `tokenB` TokenB address
- `amountADesired` -
- `amountBDesired` -
- `amountAMin` -
- `amountBMin` -
- `to` Recipient
- `deadline` Expired timestamp(unix)
- Returns `amountA` Used tokenA quantity, `amountB` Used tokenB quantity, `liquidity` Pair token quantity

##### removeLiquidity

```cairo
func removeLiquidity(
    tokenA : felt,
    tokenB : felt,
    liquidity : Uint256,
    amountAMin : Uint256,
    amountBMin : Uint256,
    to : felt,
    deadline : felt,
) -> (amountA : Uint256, amountB : Uint256):
end
```

- `tokenA` TokenA address
- `tokenB` TokenB address
- `liquidity` Pair token quantity
- `amountAMin` -
- `amountBMin` -
- `to` Recipient
- `deadline` Expired timestamp(unix)
- Returns `amountA` Received tokenA quantity, `amountB` Received tokenB quantity

##### swapExactTokensForTokens

```cairo
func swapExactTokensForTokens(
    amountIn : Uint256,
    amountOutMin : Uint256,
    path_len : felt,
    path : felt*,
    to : felt,
    deadline : felt,
) -> (amounts_len : felt, amounts : Uint256*):
end
```

- `amountIn` -
- `amountOutMin` -
- `path_len` -
- `path` -
- `to` Recipient
- `deadline` Expired timestamp(unix)
- Returns `amounts_len` amounts's length, `amounts` received tokens amount

##### swapTokensForExactTokens

```cairo
func swapTokensForExactTokens(
    amountOut : Uint256,
    amountInMax : Uint256,
    path_len : felt,
    path : felt*,
    to : felt,
    deadline : felt,
) -> (amounts_len : felt, amounts : Uint256*):
end
```

- `amountOut` -
- `amountInMax` -
- `path_len` -
- `path` -
- `to` Recipient
- `deadline` Expired timestamp(unix)
- Returns `amounts_len` amounts's length, `amounts` send tokens amount

##### swapExactTokensForTokensSupportingFeeOnTransferTokens

```cairo
func swapExactTokensForTokensSupportingFeeOnTransferTokens(
    amountIn : Uint256,
    amountOutMin : Uint256,
    path_len : felt,
    path : felt*,
    to : felt,
    deadline : felt,
):
end
```

- `amountIn` -
- `amountOutMin` -
- `path_len` -
- `path` -
- `to` Recipient
- `deadline` Expired timestamp(unix)
- Returns `amounts_len` amounts's length, `amounts` send tokens amount
