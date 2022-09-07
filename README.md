# 10k Swap Contracts for Cairo

**A decentralized ZK Rollup low gas fee AMM** written in Cairo for [StarkNet](https://starkware.co/product/starknet/).

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

- Mainnet: `-`
- Goerli: `0x06c31f39524388c982045988de3788530605ed08b10389def2e7b1dd09d19308`

#### constructor

```
func constructor(pairClass : felt, feeToSetter : felt):
end
```

- `pairClass` l0k_pair contract class hash
- `feeToSetter` feeTo address manager

#### `view` feeTo

```cairo
func feeTo() -> (feeTo : felt):
end
```

- `RETURNS`: feeTo - fee to address(5‰)

#### `view` feeToSetter

- Params: -

- Returns:

| Name        | Type | Desc |
| ----------- | ---- | ---- |
| feeToSetter | felt | -    |

#### `view` getPair

- Params:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| tokenA | felt | -    |
| tokenA | felt | -    |

- Returns:

| Name | Type | Desc |
| ---- | ---- | ---- |
| pair | felt | -    |

#### `view` allPairs

- Params:

| Name  | Type | Desc |
| ----- | ---- | ---- |
| index | felt | -    |

- Returns:

| Name | Type | Desc |
| ---- | ---- | ---- |
| pair | felt | -    |

#### `view` allPairsLength

- Params: -

- Returns:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| length | felt | -    |

#### `external` createPair

- Params:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| tokenA | felt | -    |
| tokenB | felt | -    |

- Returns:

| Name | Type | Desc |
| ---- | ---- | ---- |
| pair | felt | -    |

#### `external` setFeeTo

- Params:

| Name  | Type | Desc |
| ----- | ---- | ---- |
| feeTo | felt | -    |

- Returns: -

#### `external` setFeeToSetter

- Params:

| Name           | Type | Desc |
| -------------- | ---- | ---- |
| setFeeToSetter | felt | -    |

- Returns: -

### Il0kPair

> ERC20 functions are ignored here

#### `view` MINIMUM_LIQUIDITY

- Params: -

- Returns:

| Name  | Type    | Desc |
| ----- | ------- | ---- |
| value | Uint256 | -    |

#### `view` factory

- Params: -

- Returns:

| Name    | Type | Desc |
| ------- | ---- | ---- |
| factory | felt | -    |

#### `view` token0

- Params: -

- Returns:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| token0 | felt | -    |

#### `view` token1

- Params: -

- Returns:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| token1 | felt | -    |

#### `view` getReserves

- Params: -

- Returns:

| Name               | Type | Desc |
| ------------------ | ---- | ---- |
| reserve0           | felt | -    |
| reserve1           | felt | -    |
| blockTimestampLast | felt | -    |

#### `view` price0CumulativeLast

- Params: -

- Returns:

| Name   | Type    | Desc |
| ------ | ------- | ---- |
| price0 | Uint256 | -    |

#### `view` price1CumulativeLast

- Params: -

- Returns:

| Name   | Type    | Desc |
| ------ | ------- | ---- |
| price1 | Uint256 | -    |

#### `view` kLast

- Params: -

- Returns:

| Name  | Type    | Desc |
| ----- | ------- | ---- |
| kLast | Uint256 | -    |

#### `external` mint

- Params:

| Name | Type | Desc |
| ---- | ---- | ---- |
| to   | felt | -    |

- Returns:

| Name      | Type    | Desc |
| --------- | ------- | ---- |
| liquidity | Uint256 | -    |

#### `external` burn

- Params:

| Name | Type | Desc |
| ---- | ---- | ---- |
| to   | felt | -    |

- Returns:

| Name    | Type    | Desc |
| ------- | ------- | ---- |
| amount0 | Uint256 | -    |
| amount1 | Uint256 | -    |

#### `external` swap

- Params:

| Name       | Type    | Desc |
| ---------- | ------- | ---- |
| amount0Out | Uint256 | -    |
| amount1Out | Uint256 | -    |
| to         | felt    | -    |

- Returns: -

#### `external` skim

- Params:

| Name | Type | Desc |
| ---- | ---- | ---- |
| to   | felt | -    |

- Returns: -

#### `external` sync

- Params: -

- Returns: -

#### `external` initialize

- Params:

| Name   | Type | Desc |
| ------ | ---- | ---- |
| token0 | felt | -    |
| token1 | felt | -    |

- Returns: -

### Il0kRouter

#### `view` factory

- Params: -

- Returns:

| Name    | Type | Desc |
| ------- | ---- | ---- |
| factory | felt | -    |

#### `view` quote

- Params:

| Name     | Type    | Desc |
| -------- | ------- | ---- |
| amountA  | Uint256 | -    |
| reserveA | felt    | -    |
| reserveB | felt    | -    |

- Returns:

| Name    | Type    | Desc |
| ------- | ------- | ---- |
| amountB | Uint256 | -    |

#### `view` getAmountOut

- Params:

| Name       | Type    | Desc |
| ---------- | ------- | ---- |
| amountIn   | Uint256 | -    |
| reserveIn  | felt    | -    |
| reserveOut | felt    | -    |

- Returns:

| Name      | Type    | Desc |
| --------- | ------- | ---- |
| amountOut | Uint256 | -    |

#### `view` getAmountIn

- Params:

| Name       | Type    | Desc |
| ---------- | ------- | ---- |
| amountOut  | Uint256 | -    |
| reserveIn  | felt    | -    |
| reserveOut | felt    | -    |

- Returns:

| Name     | Type    | Desc |
| -------- | ------- | ---- |
| amountIn | Uint256 | -    |

#### `view` getAmountsOut

- Params:

| Name     | Type    | Desc |
| -------- | ------- | ---- |
| amountIn | Uint256 | -    |
| path_len | felt    | -    |
| path     | felt\*  | -    |

- Returns:

| Name        | Type      | Desc |
| ----------- | --------- | ---- |
| amounts_len | felt      | -    |
| amounts_len | Uint256\* | -    |

#### `view` getAmountsIn

- Params:

| Name      | Type    | Desc |
| --------- | ------- | ---- |
| amountOut | Uint256 | -    |
| path_len  | felt    | -    |
| path      | felt\*  | -    |

- Returns:

| Name        | Type      | Desc |
| ----------- | --------- | ---- |
| amounts_len | felt      | -    |
| amounts_len | Uint256\* | -    |

#### `external` addLiquidity

- Params:

| Name           | Type    | Desc |
| -------------- | ------- | ---- |
| tokenA         | felt    | -    |
| tokenB         | felt    | -    |
| amountADesired | Uint256 | -    |
| amountBDesired | Uint256 | -    |
| amountAMin     | Uint256 | -    |
| amountBMin     | Uint256 | -    |
| to             | felt    | -    |
| deadline       | felt    | -    |

- Returns:

| Name      | Type    | Desc |
| --------- | ------- | ---- |
| amountA   | Uint256 | -    |
| amountB   | Uint256 | -    |
| liquidity | Uint256 | -    |

#### `external` removeLiquidity

- Params:

| Name       | Type    | Desc |
| ---------- | ------- | ---- |
| tokenA     | felt    | -    |
| tokenB     | felt    | -    |
| liquidity  | Uint256 | -    |
| amountAMin | Uint256 | -    |
| amountBMin | Uint256 | -    |
| to         | felt    | -    |
| deadline   | felt    | -    |

- Returns:

| Name    | Type    | Desc |
| ------- | ------- | ---- |
| amountA | Uint256 | -    |
| amountB | Uint256 | -    |

#### `external` swapExactTokensForTokens

- Params:

| Name         | Type    | Desc |
| ------------ | ------- | ---- |
| amountIn     | Uint256 | -    |
| amountOutMin | Uint256 | -    |
| path_len     | felt    | -    |
| path         | felt\*  | -    |
| to           | felt    | -    |
| deadline     | felt    | -    |

- Returns:

| Name        | Type      | Desc |
| ----------- | --------- | ---- |
| amounts_len | felt      | -    |
| amounts     | Uint256\* | -    |

#### `external` swapTokensForExactTokens

- Params:

| Name        | Type    | Desc |
| ----------- | ------- | ---- |
| amountOut   | Uint256 | -    |
| amountInMax | Uint256 | -    |
| path_len    | felt    | -    |
| path        | felt\*  | -    |
| to          | felt    | -    |
| deadline    | felt    | -    |

- Returns:

| Name        | Type      | Desc |
| ----------- | --------- | ---- |
| amounts_len | felt      | -    |
| amounts     | Uint256\* | -    |

#### `external` swapExactTokensForTokensSupportingFeeOnTransferTokens

- Params:

| Name         | Type    | Desc |
| ------------ | ------- | ---- |
| amountIn     | Uint256 | -    |
| amountOutMin | Uint256 | -    |
| path_len     | felt    | -    |
| path         | felt\*  | -    |
| to           | felt    | -    |
| deadline     | felt    | -    |

- Returns: -
