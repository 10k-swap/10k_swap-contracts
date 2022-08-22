import { expect } from "chai";
import hardhat, { starknet } from "hardhat";

describe("Amm pair declare", function () {
  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/l0k_pair.cairo"],
    });
  });

  it("Test declare", async function () {
    const contractFactory = await starknet.getContractFactory("l0k_pair");
    const pairContractClassHash = await contractFactory.declare();
    console.log("pairContractClassHash: ", pairContractClassHash);

    expect(pairContractClassHash).to.not.equal(BigInt(0));
  });
});
