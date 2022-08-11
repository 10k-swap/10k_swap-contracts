# 10k Swap Contracts for Cairo

**A decentralized ZK Rollup AMM** written in Cairo for [StarkNet](https://starkware.co/product/starknet/).

## Get started

#### Clone this repo

```
git clone git@github.com:0x60018/10k_swap-contracts.git
cd 10k_swap-contracts
```

#### Install dependencies

```
npm ci
```

#### Compile a contract

```
npx hardhat starknet-compile contracts/l0k_erc20.cairo
```

#### Run a test that interacts with the compiled contract

```
npx hardhat test test_erc20.test.ts
```

## Troubleshooting

## Branches

- `main`

### Branch updating (for developers)

- New PRs and features should be targeted to the `develop` branch.

## Contracts interface

### Il0kFactory

#### `view` feeTo

- Params: -

- Returns:

| Name  | Type | Desc |
| ----- | ---- | ---- |
| feeTo | felt | -    |

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
