import { expect } from "chai";
import { BigNumber } from "ethers";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types";
import JSBI from "jsbi";
import { number, shortString } from "starknet";
import { computeHashOnElements, pedersen } from "starknet/dist/utils/hash";
import { BigNumberish, toFelt } from "starknet/dist/utils/number";
import { uint256ToBN } from "starknet/dist/utils/uint256";
import { ONE, THREE, TWO, ZERO } from "./constants";

export function expectFeeEstimationStructure(fee: any) {
  console.log("Estimated fee:", fee);
  expect(fee).to.haveOwnProperty("amount");
  expect(typeof fee.amount).to.equal("bigint");
  expect(fee.unit).to.equal("wei");
}

export function ensureEnvVar(varName: string): string {
  if (!process.env[varName]) {
    throw new Error(`Env var ${varName} not set or empty`);
  }
  return process.env[varName] as string;
}

/**
 * Receives a hex address, converts it to bigint, converts it back to hex.
 * This is done to strip leading zeros.
 * @param address a hex string representation of an address
 * @returns an adapted hex string representation of the address
 */
function adaptAddress(address: string) {
  return "0x" + BigInt(address).toString(16);
}

/**
 * Expects address equality after adapting them.
 * @param actual
 * @param expected
 */
export function expectAddressEquality(actual: string, expected: string) {
  expect(adaptAddress(actual)).to.equal(adaptAddress(expected));
}

/**
 * Parse string to starknet flet
 * @param str
 * @returns
 */
export function stringToFelt(str: string) {
  return toFelt("0x" + Buffer.from(str).toString("hex"));
}

/**
 * Get openZeppelin account from env
 * @returns
 */
export async function envAccountOZ(index: number) {
  const suffix = index > 0 ? `_${index}` : "";

  const address = ensureEnvVar(`OZ_ACCOUNT_ADDRESS${suffix}`);
  const privateKey = ensureEnvVar(`OZ_ACCOUNT_PRIVATE_KEY${suffix}`);

  let account: OpenZeppelinAccount;
  try {
    account = <OpenZeppelinAccount>(
      await starknet.getAccountFromAddress(address, privateKey, "OpenZeppelin")
    );
  } catch (err) {
    account = <OpenZeppelinAccount>await starknet.deployAccount(
      "OpenZeppelin",
      {
        privateKey,
        salt: privateKey,
      }
    );
    console.log("Deploy account:", account.address);
  }

  return account;
}

// Compute pair contract address
export function computePairAddress(
  factory: BigNumberish,
  pairClass: BigNumberish,
  tokenA: BigNumberish,
  tokenB: BigNumberish
) {
  const CONTRACT_ADDRESS_PREFIX = shortString.encodeShortString(
    "STARKNET_CONTRACT_ADDRESS"
  );

  let token0 = tokenA,
    token1 = tokenB;
  const gt = number.toBN(tokenA).gt(number.toBN(tokenB));
  if (gt) {
    token0 = tokenB;
    token1 = tokenA;
  }

  const salt = pedersen([token0, token1]);
  const constructorCalldataHash = computeHashOnElements([]);
  const pair = computeHashOnElements([
    CONTRACT_ADDRESS_PREFIX,
    factory,
    salt,
    pairClass,
    constructorCalldataHash,
  ]);

  return pair;
}

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

export async function getPairAmounts({ l0kPairContract }: { l0kPairContract: StarknetContract }) {
  try {
    const [{ totalSupply }, { reserve0, reserve1 }, { kLast }] = await Promise.all([
      l0kPairContract.call("totalSupply"),
      l0kPairContract.call('getReserves'),
      l0kPairContract.call('kLast')
    ])
    return {
      totalSupply: uint256ToBN(totalSupply).toString(),
      reserve0: (reserve0).toString(),
      reserve1: (reserve1).toString(),
      kLast: uint256ToBN(kLast).toString()
    }
  } catch (error) {
    return {
      totalSupply: '0',
      reserve0: '0',
      reserve1: '0',
      kLast: '0'
    }
  }
}

export async function getTokenBalances(account: OpenZeppelinAccount, [tokenAContract, tokenBContract]: [StarknetContract, StarknetContract]) {
  const { balance: balanceTokenA } = await tokenAContract.call("balanceOf", {
    account: account.address,
  });
  const { balance: balanceTokenB } = await tokenBContract.call("balanceOf", {
    account: account.address,
  });
  return {
    balanceTokenA: uint256ToBN(balanceTokenA).toString(),
    balanceTokenB: uint256ToBN(balanceTokenB).toString()
  };
}
