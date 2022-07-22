import { expect } from "chai";
import { utils } from "ethers";
import { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types/runtime";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import { envAccountOZ, hardhatCompile, stringToFelt } from "./util";

describe("l0k_erc20", function () {
  let l0kErc20Contract: StarknetContract;
  const nameFelt = stringToFelt("10K Swap A");
  const symbolFelt = stringToFelt("A");

  before(async function () {
    await hardhatCompile("contracts/l0k_erc20.cairo");

    console.log("Deploying ", new Date());
    const contractFactory = await starknet.getContractFactory("l0k_erc20");
    l0kErc20Contract = await contractFactory.deploy({
      name: nameFelt,
      symbol: symbolFelt,
    });
    console.log("l0kErc20Contract.address: ", l0kErc20Contract.address);
  });

  // it("Test name & symbol", async function () {
  //   const { symbol } = await l0kErc20Contract.call("symbol");
  //   expect(symbol).to.equal(BigInt(symbolFelt));

  //   const { name } = await l0kErc20Contract.call("name");
  //   expect(name).to.equal(BigInt(nameFelt));
  // });

  it("Test mint", async function () {
    const to = 0x1234;
    const mintAmount = bnToUint256(utils.parseEther("1") + "");
    await l0kErc20Contract.invoke("mint", {
      to,
      amount: mintAmount,
    });

    const { balance } = await l0kErc20Contract.call("balanceOf", {
      account: to,
    });
    expect(BigInt(balance.high)).to.equal(BigInt(mintAmount.high + ""));
    expect(BigInt(balance.low)).to.equal(BigInt(mintAmount.low + ""));
  });
});
