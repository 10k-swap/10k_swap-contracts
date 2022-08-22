import hardhat, { starknet } from "hardhat";
import { StarknetContract } from "hardhat/types/runtime";
import { getSelectorFromName } from "starknet/dist/utils/hash";
import { toFelt } from "starknet/dist/utils/number";
import { MAX_FEE } from "./constants";

describe("ERC20", function () {
  let erc20Contract: StarknetContract;

  before(async () => {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/tests/test_erc20.cairo"],
    });

    const contractFactory = await starknet.getContractFactory(
      "contracts/tests/test_erc20"
    );

    erc20Contract = await contractFactory.deploy();
    console.log("erc20Contract.address:", erc20Contract.address);
  });

  it("Test mint", async function () {
    const toAddress =
      "0x00468378c96d70b2B3f473EA276cB2f3910C8CaFE231a6E9B84B074ebfD9829F";
    const hash = await erc20Contract.invoke(
      "mint",
      {
        to: toFelt(toAddress),
      },
      { maxFee: MAX_FEE }
    );
    console.warn("hash: ", hash);

    const selector = getSelectorFromName("Transfer");
    console.warn("selector:", selector);

    const receipt = await starknet.getTransactionReceipt(hash);
    console.warn("events: ", receipt.events);
  });
});
