import { expect } from "chai";
import { command } from "execa";
import { starknet } from "hardhat";
import { OpenZeppelinAccount } from "hardhat/types";
import { number, shortString } from "starknet";
import { computeHashOnElements, pedersen } from "starknet/dist/utils/hash";
import { BigNumberish, toFelt } from "starknet/dist/utils/number";

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
 * Hardhat compile contract
 * @param contractPath
 */
export async function hardhatCompile(contractPath: string) {
  const { stdout } = await command(`hardhat starknet-compile ${contractPath}`);
  process.stdout.write(stdout);
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
