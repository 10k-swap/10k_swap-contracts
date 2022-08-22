import { expect } from "chai";
import { utils } from "ethers";
import hardhat, { starknet } from "hardhat";
import { OpenZeppelinAccount, StarknetContract } from "hardhat/types/runtime";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { MAX_FEE } from "./constants";
import { envAccountOZ, stringToFelt } from "./util";

describe("l0k_erc20", function () {
  let account0: OpenZeppelinAccount;
  let account1: OpenZeppelinAccount;
  let l0kErc20Contract: StarknetContract;
  const nameFelt = stringToFelt(process.env.TOKEN_NAME || "10K Swap A");
  const symbolFelt = stringToFelt(process.env.TOKEN_SYMBOL || "A");

  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/l0k_erc20.cairo"],
    });

    account0 = await envAccountOZ(0);
    account1 = await envAccountOZ(1);

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

  it("Test ownerMint", async function () {
    const to = account0.address;
    const mintAmount = bnToUint256(utils.parseEther("1000") + "");
    await l0kErc20Contract.invoke(
      "mint",
      {
        to,
        amount: mintAmount,
      },
      { maxFee: MAX_FEE }
    );

    const { balance } = await l0kErc20Contract.call("balanceOf", {
      account: to,
    });
    expect(BigInt(balance.high)).to.equal(BigInt(mintAmount.high + ""));
    expect(BigInt(balance.low)).to.equal(BigInt(mintAmount.low + ""));
  });

  it("Test transfer", async function () {
    const transferAmount = bnToUint256(utils.parseEther("50") + "");
    await account0.invoke(l0kErc20Contract, "transfer", {
      recipient: account1.address,
      amount: transferAmount,
    });

    const { balance } = await l0kErc20Contract.call("balanceOf", {
      account: account1.address,
    });

    expect(uint256ToBN(balance) + "").to.equal(
      uint256ToBN(transferAmount) + ""
    );
  });
});
