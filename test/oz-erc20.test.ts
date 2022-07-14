import { expect } from "chai";
import { BigNumberish } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { starknet } from "hardhat";
import {
  StarknetContract,
  StarknetContractFactory,
} from "hardhat/types/runtime";
import { uint256 } from "starknet";
import { toFelt } from "starknet/dist/utils/number";
import { bnToUint256 } from "starknet/dist/utils/uint256";
import { ensureEnvVar } from "./util";

describe("OZ Erc20", function () {
  const MAX_FEE = BigInt(1e18);

  let erc20Contract: StarknetContract;

  before(async () => {
    const contractFactory = await starknet.getContractFactory(
      "contracts/openzeppelin/token/erc20/ERC20"
    );

    // erc20Contract = await contractFactory.deploy({
    //   name: toFelt(
    //     "0x" + Buffer.from("10k Fake Token", "utf-8").toString("hex")
    //   ),
    //   symbol: toFelt("0x" + Buffer.from("FToken", "utf-8").toString("hex")),
    //   decimals: toFelt(18),
    //   initial_supply: bnToUint256(parseEther("200") + ""),
    //   recipient: toFelt(
    //     "0x076a11bD32505AB9E8e6B6c9e269faB5D7fA0ECbEefb77fa8C5b9ddEa8E73a64"
    //   ),
    // });
    erc20Contract = contractFactory.getContractAt(
      "0x01edc470728553a55f587e4443f2d4c879461f1d4a85183317dea24303d3d76a"
    );
    console.log("erc20Contract.address:", erc20Contract.address);

    starknet.getWallet("");
  });

  it("should work for a fresh deployment", async function () {
    // expect(balanceAfter).to.deep.equal(30n);
    const value = await erc20Contract.invoke(
      "transfer",
      {
        recipient: toFelt(
          "0x00468378c96d70b2B3f473EA276cB2f3910C8CaFE231a6E9B84B074ebfD9829F"
        ),
        amount: bnToUint256(parseEther("100") + ""),
      },
      { maxFee: MAX_FEE }
    );
    console.warn("value: ", value);
  });
});
